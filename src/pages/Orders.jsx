import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import OrderCard from '@/components/orders/OrderCard';
import { generateOrderWhatsAppMessage } from '@/components/utils/WhatsAppMessage';
import usePullToRefresh from '@/components/utils/usePullToRefresh';

const tabs = [
  { id: 'all', label: 'Todos' },
  { id: 'orcamento', label: 'Orçamentos' },
  { id: 'andamento', label: 'Em Andamento' },
  { id: 'finalizados', label: 'Finalizados' },
];

export default function Orders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { pullDistance, isRefreshing } = usePullToRefresh(() =>
    queryClient.invalidateQueries(['orders'])
  );

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Order.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['orders']),
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'orcamento') return order.status === 'Orçamento' && matchesSearch;
    if (activeTab === 'andamento') return (order.status === 'Pendente' || order.status === 'Aprovado') && matchesSearch;
    if (activeTab === 'finalizados') return (order.status === 'Concluído' || order.status === 'Cancelado') && matchesSearch;
    return matchesSearch;
  });

  const handleApprove = async (order) => {
    await updateMutation.mutateAsync({ id: order.id, data: { status: 'Pendente' } });
  };

  const handleGenerateReceipt = (order) => {
    if (order.status === 'Orçamento') {
      navigate(createPageUrl(`QuotationView?id=${order.id}`));
    } else {
      navigate(createPageUrl(`Receipt?id=${order.id}`));
    }
  };

  const { data: settings = [] } = useQuery({
    queryKey: ['appSettings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.AppSettings.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const handleShare = (order) => {
    const text = generateOrderWhatsAppMessage(order, settings[0] || {});
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const { data: appSettings = [] } = useQuery({
    queryKey: ['appSettings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.AppSettings.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const primaryColor = appSettings[0]?.primary_color || '#2d91a8';

  return (
    <div className="min-h-screen bg-[#07151D] text-[#E5F3F7] pb-12">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: isRefreshing ? 44 : pullDistance * 0.55 }}
        >
          <RefreshCw
            className={`w-5 h-5 text-[#34A8A6] ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ opacity: Math.min(pullDistance / 80, 1) }}
          />
        </div>
      )}
      {/* Header */}
      <div className="bg-[#0D222E] border-b border-[#1C4156] px-4 sm:px-6 lg:px-8 pt-8 pb-5 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Pedidos e Orçamentos</h1>
              <p className="text-xs text-[#A3D2DF]">Controle de propostas e vendas realizadas</p>
            </div>
            <Link
              to={createPageUrl('OrderForm')}
              className="h-10 px-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Novo Pedido</span>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-3.5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8EB3BD]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar pedidos por cliente, número ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#081924] border border-[#1C4156] text-white placeholder-[#6E9AA6] rounded-xl text-sm focus:outline-none focus:border-[#34A8A6] transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar -mx-1 px-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold shadow-md'
                    : 'bg-[#081924] text-[#A3D2DF] border border-[#1C4156] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid - Multi-column horizontal desktop display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-[#0D222E] border border-[#1C4156] rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#133345]" />
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-[#133345] rounded" />
                      <div className="w-16 h-3 bg-[#133345] rounded" />
                    </div>
                  </div>
                  <div className="w-20 h-5 bg-[#133345] rounded" />
                </div>
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onApprove={handleApprove}
                  onGenerateReceipt={handleGenerateReceipt}
                  onShare={handleShare}
                  onClick={() => navigate(createPageUrl(`OrderForm?id=${order.id}`))}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0D222E] border border-[#1C4156] rounded-2xl p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#081924] border border-[#1C4156]">
                <Filter className="w-8 h-8 text-[#4BCBB4]" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-white mb-1">Nenhum pedido encontrado</h3>
              <p className="text-sm text-[#A3D2DF]">Crie um novo orçamento ou pedido para começar.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
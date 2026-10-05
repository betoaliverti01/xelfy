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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: isRefreshing ? 44 : pullDistance * 0.55 }}
        >
          <RefreshCw
            className={`w-5 h-5 text-[#2d91a8] ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ opacity: Math.min(pullDistance / 80, 1) }}
          />
        </div>
      )}
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#333333]">Pedidos</h1>
          <Link
            to={createPageUrl('OrderForm')}
            style={{ backgroundColor: primaryColor }}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2} />
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F9F9F9] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? { backgroundColor: primaryColor } : {}}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-5 py-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[20px] p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-gray-200 rounded" />
                      <div className="w-16 h-3 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="w-20 h-5 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onApprove={handleApprove}
                onGenerateReceipt={handleGenerateReceipt}
                onShare={handleShare}
                onClick={() => navigate(createPageUrl(`OrderForm?id=${order.id}`))}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[20px] p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}20` }}>
                <Filter className="w-8 h-8" style={{ color: `${primaryColor}66` }} strokeWidth={1.5} />
              </div>
              <p className="text-gray-400">Nenhum pedido encontrado</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
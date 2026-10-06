import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, ChevronRight, ArrowDownRight, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from '@/components/notifications/NotificationBell';
import FinancialCards from '@/components/dashboard/FinancialCards';
import FinancialChart from '@/components/dashboard/FinancialChart';
import QuickActions from '@/components/dashboard/QuickActions';
import RevenueChart from '@/components/dashboard/RevenueChart';
import OrderCard from '@/components/orders/OrderCard';
import AccountsOverview from '@/components/dashboard/AccountsOverview';
import { createPageUrl } from '@/utils';
import { generateOrderWhatsAppMessage } from '@/components/utils/WhatsAppMessage';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [revenuePeriod, setRevenuePeriod] = useState(7); // 7, 15, or 30 days
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Order.filter({ created_by: user.email }, '-created_date', 50);
    },
    enabled: !!user?.email,
  });

  const { data: financials = [] } = useQuery({
    queryKey: ['financials', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Financial.filter({ created_by: user.email }, '-created_date', 100);
    },
    enabled: !!user?.email,
  });

  // Calculate financial summaries - based on open financial records
  const toReceive = financials
    .filter(f => f.type === 'Receita' && f.status === 'Aberto')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const receivedThisMonth = financials
    .filter(f => 
      f.type === 'Receita' && 
      f.status === 'Pago' &&
      f.payment_date &&
      new Date(f.payment_date) >= monthStart &&
      new Date(f.payment_date) <= monthEnd
    )
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const expensesThisMonth = financials
    .filter(f => 
      f.type === 'Despesa' &&
      f.status === 'Pago' &&
      f.payment_date &&
      new Date(f.payment_date) >= monthStart &&
      new Date(f.payment_date) <= monthEnd
    )
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const profitThisMonth = receivedThisMonth - expensesThisMonth;

  const financialChartData = [
    { name: 'Receita', value: receivedThisMonth, label: 'Receita' },
    { name: 'Despesa', value: expensesThisMonth, label: 'Despesa' },
    { name: 'Lucro', value: profitThisMonth, label: 'Lucro' },
  ];

  // Calculate revenue for selected period
  const revenueData = Array.from({ length: revenuePeriod }, (_, i) => {
    const date = subDays(new Date(), revenuePeriod - 1 - i);
    const day = format(date, 'dd');
    const dayFinancials = financials.filter(f => 
      f.type === 'Receita' && 
      f.payment_date &&
      format(new Date(f.payment_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const value = dayFinancials.reduce((sum, f) => sum + (f.amount || 0), 0);
    return { day, value };
  });

  const recentOrders = orders.slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleApprove = async (order) => {
    await base44.entities.Order.update(order.id, { status: 'Pendente' });
    queryClient.invalidateQueries(['orders']);
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

  return (
    <div className="min-h-screen bg-[#07151D] text-[#E5F3F7]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00485C] via-[#0A2E3B] to-[#07151D] border-b border-[#1C4156]">
        {settings[0]?.company_cover && (
          <div className="absolute inset-0 opacity-20">
            <img 
              key={settings[0].company_cover}
              src={settings[0].company_cover} 
              alt="Capa" 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto px-5 pt-8 pb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              {settings[0]?.company_logo ? (
                <div className="w-14 h-14 min-w-[56px] rounded-2xl overflow-hidden bg-[#00485C] border border-[#34A8A6]/40 shadow-md flex-shrink-0 p-1">
                  <img src={settings[0].company_logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 min-w-[56px] rounded-2xl bg-[#00485C] border border-[#34A8A6]/40 p-1 flex items-center justify-center shadow-md flex-shrink-0">
                  <img src="/logo.png" alt="xelfy" className="w-full h-full object-contain" />
                </div>
              )}
              <div>
                <p className="text-[#8EB3BD] text-xs font-semibold uppercase tracking-wider">{getGreeting()}</p>
                <h1 className="font-extrabold text-white text-lg sm:text-xl">
                  {settings[0]?.company_name || user?.full_name || 'xelfy Painel'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationBell user={user} />
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Deseja realmente sair da sua conta?')) {
                    base44.auth.logout();
                  }
                }}
                title="Sair da conta"
                aria-label="Sair da conta"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/20 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <FinancialCards 
                toReceive={toReceive} 
                receivedThisMonth={receivedThisMonth} 
              />
            </div>
            
            <div className="lg:col-span-7">
              <FinancialChart data={financialChartData} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content - Horizontal Desktop Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Actions (Full horizontal row) */}
        <QuickActions />

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Revenue Chart & Accounts (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Revenue Chart Card */}
            <div className="bg-[#0D222E] border border-[#1C4156] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="font-extrabold text-white text-base">Receita</h2>
                  <p className="text-xs text-[#A3D2DF]">Evolução do faturamento</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRevenuePeriod(7)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      revenuePeriod === 7 
                        ? 'bg-gradient-to-r from-[#238799] via-[#34A8A6] to-[#4BCBB4] text-gray-950 font-bold shadow-md shadow-teal-950/30' 
                        : 'bg-[#081924] text-[#A3D2DF] border border-[#1C4156] hover:text-white'
                    }`}
                  >
                    7 dias
                  </button>
                  <button
                    onClick={() => setRevenuePeriod(15)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      revenuePeriod === 15 
                        ? 'bg-gradient-to-r from-[#238799] via-[#34A8A6] to-[#4BCBB4] text-gray-950 font-bold shadow-md shadow-teal-950/30' 
                        : 'bg-[#081924] text-[#A3D2DF] border border-[#1C4156] hover:text-white'
                    }`}
                  >
                    15 dias
                  </button>
                  <button
                    onClick={() => setRevenuePeriod(30)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      revenuePeriod === 30 
                        ? 'bg-gradient-to-r from-[#238799] via-[#34A8A6] to-[#4BCBB4] text-gray-950 font-bold shadow-md shadow-teal-950/30' 
                        : 'bg-[#081924] text-[#A3D2DF] border border-[#1C4156] hover:text-white'
                    }`}
                  >
                    30 dias
                  </button>
                </div>
              </div>
              <RevenueChart data={revenueData} />
            </div>

            {/* Accounts Overview */}
            <AccountsOverview user={user} />
          </div>

          {/* Right Column: Clients & Recent Orders (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Clients Button */}
            <Link
              to={createPageUrl('ClientsList')}
              className="bg-[#0D222E] border border-[#1C4156] hover:border-[#34A8A6]/60 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-[#00485C] border border-[#34A8A6]/40 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#4BCBB4]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-[#4BCBB4] transition-colors">Meus Clientes</h3>
                  <p className="text-xs text-[#A3D2DF]">Histórico e detalhes de clientes</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8EB3BD] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Recent Orders */}
            <div className="bg-[#0D222E] border border-[#1C4156] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-extrabold text-white text-base">Pedidos Recentes</h2>
                  <p className="text-xs text-[#A3D2DF]">Últimas movimentações</p>
                </div>
                <Link 
                  to={createPageUrl('Orders')}
                  className="text-xs font-bold text-[#4BCBB4] hover:underline"
                >
                  Ver todos
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
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
                  <div className="bg-[#081924] border border-[#1C4156] rounded-xl p-8 text-center">
                    <p className="text-[#8EB3BD] text-xs">Nenhum pedido recente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))` }}>
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
          className="relative px-5 pt-12 pb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {settings[0]?.company_logo ? (
                <div className="w-16 h-16 min-w-[64px] rounded-full overflow-hidden bg-white shadow-md flex-shrink-0">
                  <img src={settings[0].company_logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : user?.full_name ? (
                <div className="w-14 h-14 min-w-[56px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md flex-shrink-0 border-2 border-white">
                  <span className="text-white font-bold text-xl">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : null}
              <div>
                <p className="text-white/70 text-sm">{getGreeting()}</p>
                <h1 className="font-bold text-white text-lg">
                  {settings[0]?.company_name || user?.full_name || 'Bem-vindo'}
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
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/20 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          


          <div className="mt-6 space-y-4">
            <FinancialCards 
              toReceive={toReceive} 
              receivedThisMonth={receivedThisMonth} 
            />
            
            <div className="grid grid-cols-1 gap-4">
              <FinancialChart data={financialChartData} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Accounts Overview */}
        <AccountsOverview user={user} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Clients Button */}
        <Link
          to={createPageUrl('ClientsList')}
          className="bg-white rounded-[20px] p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-[#333333]">Meus Clientes</h3>
              <p className="text-xs text-gray-400">Ver histórico e detalhes</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </Link>

        {/* Revenue Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#333333]">Receita</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setRevenuePeriod(7)}
                style={revenuePeriod === 7 ? { backgroundColor: 'var(--color-primary)' } : {}}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  revenuePeriod === 7 ? 'text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                7 dias
              </button>
              <button
                onClick={() => setRevenuePeriod(15)}
                style={revenuePeriod === 15 ? { backgroundColor: 'var(--color-primary)' } : {}}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  revenuePeriod === 15 ? 'text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                15 dias
              </button>
              <button
                onClick={() => setRevenuePeriod(30)}
                style={revenuePeriod === 30 ? { backgroundColor: 'var(--color-primary)' } : {}}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  revenuePeriod === 30 ? 'text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                30 dias
              </button>
            </div>
          </div>
          <RevenueChart data={revenueData} />
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#333333]">Pedidos Recentes</h2>
            <Link 
              to={createPageUrl('Orders')}
              className="text-sm font-medium"
              style={{ color: 'var(--color-primary)' }}
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
              <div className="bg-white rounded-[20px] p-8 text-center">
                <p className="text-gray-400 text-sm">Nenhum pedido ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
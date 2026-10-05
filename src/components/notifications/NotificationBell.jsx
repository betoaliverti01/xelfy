import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Clock, DollarSign, Calendar } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NotificationBell({ user }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: readNotifications = [] } = useQuery({
    queryKey: ['readNotifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.ReadNotification.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Order.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const { data: financials = [] } = useQuery({
    queryKey: ['financials', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Financial.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  // Calculate notifications
  const notifications = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Pedidos atrasados (due_date passou e status não é Concluído/Cancelado)
  orders.forEach(order => {
    if (order.due_date && !['Concluído', 'Cancelado'].includes(order.status)) {
      const dueDate = new Date(order.due_date);
      const daysLate = differenceInDays(today, dueDate);
      
      if (daysLate > 0) {
        notifications.push({
          id: `order-late-${order.id}`,
          type: 'danger',
          icon: AlertTriangle,
          title: 'Pedido Atrasado',
          message: `${order.client_name} - ${daysLate} dia(s) de atraso`,
          date: order.due_date,
          action: () => navigate(createPageUrl(`OrderForm?id=${order.id}`)),
        });
      } else if (daysLate === 0 || isToday(dueDate)) {
        notifications.push({
          id: `order-today-${order.id}`,
          type: 'warning',
          icon: Clock,
          title: 'Entrega Hoje',
          message: `${order.client_name} - vence hoje`,
          date: order.due_date,
          action: () => navigate(createPageUrl(`OrderForm?id=${order.id}`)),
        });
      } else if (daysLate > -3 && daysLate < 0) {
        notifications.push({
          id: `order-soon-${order.id}`,
          type: 'info',
          icon: Calendar,
          title: 'Entrega Próxima',
          message: `${order.client_name} - faltam ${Math.abs(daysLate)} dia(s)`,
          date: order.due_date,
          action: () => navigate(createPageUrl(`OrderForm?id=${order.id}`)),
        });
      }
    }
  });

  // Alertas de parcelas de pedidos
  orders.forEach(order => {
    if (order.installment_details && order.installment_details.length > 0) {
      order.installment_details.forEach(installment => {
        if (installment.status === 'Pendente' && installment.due_date) {
          const dueDate = new Date(installment.due_date);
          const daysUntil = differenceInDays(dueDate, today);
          
          if (daysUntil < 0) {
            notifications.push({
              id: `installment-late-${order.id}-${installment.number}`,
              type: 'danger',
              icon: DollarSign,
              title: 'Parcela Atrasada',
              message: `${order.client_name} - Parcela ${installment.number}/${order.installments} (R$ ${installment.amount?.toFixed(2)})`,
              date: installment.due_date,
              action: () => navigate(createPageUrl(`OrderForm?id=${order.id}`)),
            });
          } else if (daysUntil <= 3) {
            notifications.push({
              id: `installment-soon-${order.id}-${installment.number}`,
              type: 'warning',
              icon: DollarSign,
              title: daysUntil === 0 ? 'Parcela Vence Hoje' : 'Parcela Próxima',
              message: `${order.client_name} - Parcela ${installment.number}/${order.installments} (${daysUntil === 0 ? 'hoje' : `${daysUntil} dia(s)`})`,
              date: installment.due_date,
              action: () => navigate(createPageUrl(`OrderForm?id=${order.id}`)),
            });
          }
        }
      });
    }
  });

  // Pagamentos atrasados
  financials.forEach(financial => {
    if (financial.status === 'Aberto' && financial.due_date) {
      const dueDate = new Date(financial.due_date);
      const daysLate = differenceInDays(today, dueDate);
      
      if (daysLate > 0) {
        notifications.push({
          id: `payment-late-${financial.id}`,
          type: 'danger',
          icon: DollarSign,
          title: financial.type === 'Receita' ? 'Pagamento Atrasado' : 'Conta Atrasada',
          message: `${financial.category} - R$ ${financial.amount?.toFixed(2)} (${daysLate} dia(s))`,
          date: financial.due_date,
          action: () => navigate(createPageUrl(`FinancialForm?id=${financial.id}`)),
        });
      } else if (isToday(dueDate)) {
        notifications.push({
          id: `payment-today-${financial.id}`,
          type: 'warning',
          icon: DollarSign,
          title: financial.type === 'Receita' ? 'Receber Hoje' : 'Pagar Hoje',
          message: `${financial.category} - R$ ${financial.amount?.toFixed(2)}`,
          date: financial.due_date,
          action: () => navigate(createPageUrl(`FinancialForm?id=${financial.id}`)),
        });
      }
    }
  });

  // Filter out read notifications
  const readIds = new Set(readNotifications.map(r => r.notification_id));
  const unreadNotifications = notifications.filter(n => !readIds.has(n.id));

  // Sort by priority (danger > warning > info)
  const priority = { danger: 0, warning: 1, info: 2 };
  unreadNotifications.sort((a, b) => priority[a.type] - priority[b.type]);

  const typeColors = {
    danger: { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-100' },
    warning: { bg: 'bg-amber-50', icon: 'text-amber-500', border: 'border-amber-100' },
    info: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-100' },
  };

  return (
    <>
      <button
        onClick={() => setShowNotifications(true)}
        className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
      >
        <Bell className="w-5 h-5 text-white" strokeWidth={1.5} />
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-6 text-white" style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))' }}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">Notificações</h2>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/70 text-sm">
                  {unreadNotifications.length > 0
                    ? `${unreadNotifications.length} pendência(s)`
                    : 'Tudo em dia!'}
                </p>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto h-[calc(100%-120px)] p-4 space-y-3">
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((notif) => {
                    const colors = typeColors[notif.type];
                    const Icon = notif.icon;
                    
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        drag="x"
                        dragConstraints={{ left: -100, right: 0 }}
                        dragElastic={0.05}
                        dragTransition={{ bounceStiffness: 800, bounceDamping: 15 }}
                        onDragEnd={async (e, info) => {
                          if (info.offset.x < -40) {
                            await base44.entities.ReadNotification.create({
                              notification_id: notif.id,
                              read_at: new Date().toISOString(),
                            });
                            queryClient.invalidateQueries(['readNotifications']);
                          }
                        }}
                        className={`${colors.bg} border ${colors.border} rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-transform`}
                        onClick={async () => {
                          await base44.entities.ReadNotification.create({
                            notification_id: notif.id,
                            read_at: new Date().toISOString(),
                          });
                          notif.action?.();
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${colors.icon}`} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#333333] text-sm mb-1">{notif.title}</h4>
                            <p className="text-gray-600 text-sm">{notif.message}</p>
                            {notif.date && (
                              <p className="text-gray-400 text-xs mt-1">
                                {format(new Date(notif.date), "dd 'de' MMM", { locale: ptBR })}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-green-500" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-semibold text-[#333333] mb-1">Tudo em dia!</h3>
                    <p className="text-gray-400 text-sm">Nenhuma notificação no momento</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
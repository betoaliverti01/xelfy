import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin 
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrderCard from '@/components/orders/OrderCard';
import { generateOrderWhatsAppMessage } from '@/components/utils/WhatsAppMessage';

export default function Schedule() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Order.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.ScheduleEvent.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['appSettings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.AppSettings.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getOrdersForDate = (date) => {
    return orders.filter(order => {
      if (!order.order_date) return false;
      return isSameDay(new Date(order.order_date), date);
    });
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      if (!event.date) return false;
      return isSameDay(new Date(event.date), date);
    });
  };

  const selectedOrders = getOrdersForDate(selectedDate);
  const selectedEvents = getEventsForDate(selectedDate);

  const handleShare = (order) => {
    const text = generateOrderWhatsAppMessage(order, settings[0] || {});
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#07151D] text-[#E5F3F7] pb-12">
      {/* Top Banner */}
      <div className="bg-[#0D222E] border-b border-[#1C4156] px-4 sm:px-6 lg:px-8 pt-8 pb-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Agenda & Compromissos</h1>
            <p className="text-xs text-[#A3D2DF]">Organize prazos de entrega e reuniões com clientes</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl(`EventForm?date=${format(selectedDate, 'yyyy-MM-dd')}`))}
            className="h-10 px-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* Main Container - Side-by-side Horizontal Desktop Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Box (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-[#0D222E] border border-[#1C4156] rounded-2xl p-5 sm:p-6 shadow-sm">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1C4156]/60">
              <span className="text-base sm:text-lg font-black text-white capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-9 h-9 rounded-xl bg-[#081924] border border-[#1C4156] flex items-center justify-center text-[#A3D2DF] hover:text-white hover:border-[#34A8A6] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1.5 rounded-xl bg-[#081924] border border-[#1C4156] text-xs font-semibold text-[#A3D2DF] hover:text-white hover:border-[#34A8A6] transition-colors"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-9 h-9 rounded-xl bg-[#081924] border border-[#1C4156] flex items-center justify-center text-[#A3D2DF] hover:text-white hover:border-[#34A8A6] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-bold text-[#8EB3BD] uppercase tracking-wider py-1.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((day, idx) => {
                const dayOrders = getOrdersForDate(day);
                const dayEvents = getEventsForDate(day);
                const hasItems = dayOrders.length > 0 || dayEvents.length > 0;
                const isCurrent = isSameMonth(day, currentMonth);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#238799] to-[#34A8A6] text-gray-950 font-black border-[#4BCBB4] shadow-md shadow-teal-950/40'
                        : isToday
                        ? 'bg-[#00485C]/60 text-[#4BCBB4] font-bold border-[#34A8A6]/60'
                        : isCurrent
                        ? 'bg-[#081924] text-white hover:border-[#34A8A6]/40 border-[#1C4156]/60'
                        : 'bg-transparent text-[#416270] border-transparent'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">
                      {format(day, 'd')}
                    </span>
                    {hasItems && (
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isSelected ? 'bg-gray-950' : 'bg-[#4BCBB4]'
                      }`} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events & Orders (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-[#0D222E] border border-[#1C4156] rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1C4156]/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8EB3BD] tracking-wider block">Compromissos para</span>
                <h2 className="text-base sm:text-lg font-black text-white capitalize">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h2>
              </div>
              <button
                onClick={() => navigate(createPageUrl(`EventForm?date=${format(selectedDate, 'yyyy-MM-dd')}`))}
                className="w-9 h-9 bg-[#133345] hover:bg-[#1a445c] border border-[#1C4156] rounded-xl flex items-center justify-center text-[#4BCBB4] transition-colors"
                title="Adicionar evento neste dia"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {(selectedOrders.length > 0 || selectedEvents.length > 0) ? (
                <div className="space-y-3">
                  {/* Events */}
                  {selectedEvents.map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigate(createPageUrl(`EventForm?id=${event.id}`))}
                      className="group bg-[#081924] rounded-2xl p-4 border border-[#1C4156] hover:border-[#34A8A6]/60 transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00485C] border border-[#34A8A6]/40 flex items-center justify-center flex-shrink-0">
                          <CalendarIcon className="w-5 h-5 text-[#4BCBB4]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-bold text-white text-sm truncate group-hover:text-[#4BCBB4] transition-colors">
                              {event.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${
                              event.type === 'Reunião' 
                                ? 'bg-sky-950/80 text-sky-300 border-sky-800/40' 
                                : 'bg-teal-950/80 text-teal-300 border-teal-800/40'
                            }`}>
                              {event.type}
                            </span>
                          </div>
                          {(event.start_time || event.end_time) && (
                            <div className="flex items-center gap-1.5 text-xs text-[#A3D2DF] mb-0.5">
                              <Clock className="w-3.5 h-3.5 text-[#8EB3BD]" />
                              <span>{event.start_time} {event.end_time && `- ${event.end_time}`}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1.5 text-xs text-[#A3D2DF]">
                              <MapPin className="w-3.5 h-3.5 text-[#8EB3BD]" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Orders */}
                  {selectedOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onShare={handleShare}
                      onClick={() => navigate(createPageUrl(`OrderForm?id=${order.id}`))}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#081924] border border-[#1C4156] rounded-2xl p-10 text-center"
                >
                  <CalendarIcon className="w-10 h-10 text-[#4BCBB4]/60 mx-auto mb-2" strokeWidth={1.5} />
                  <h4 className="font-bold text-white text-sm mb-0.5">Sem compromissos</h4>
                  <p className="text-xs text-[#A3D2DF]">Nenhum pedido ou reunião agendado para esta data.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
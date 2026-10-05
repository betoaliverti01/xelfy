import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrderCard from '@/components/orders/OrderCard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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
      return base44.entities.Order.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Event.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getOrdersForDate = (date) => {
    return orders.filter(order => {
      if (!order.due_date) return false;
      return isSameDay(new Date(order.due_date), date);
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

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 rounded-b-[32px] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#333333]">Agenda</h1>
          <div className="w-10 h-10 bg-[#2d91a8]/10 rounded-full flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-[#2d91a8]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-[#333333] min-w-[160px] text-center capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dayOrders = getOrdersForDate(day);
            const dayEvents = getEventsForDate(day);
            const hasItems = dayOrders.length > 0 || dayEvents.length > 0;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <motion.button
                key={idx}
                onClick={() => setSelectedDate(day)}
                whileTap={{ scale: 0.95 }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#2d91a8] text-white'
                    : isToday
                    ? 'bg-[#2d91a8]/10 text-[#2d91a8]'
                    : isCurrentMonth
                    ? 'text-[#333333] hover:bg-gray-100'
                    : 'text-gray-300'
                }`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>
                  {format(day, 'd')}
                </span>
                {hasItems && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? 'bg-white' : 'bg-[#2d91a8]'
                  }`} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Content */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500">
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h2>
          <button
            onClick={() => navigate(createPageUrl(`EventForm?date=${format(selectedDate, 'yyyy-MM-dd')}`))}
            className="w-8 h-8 bg-[#2d91a8] rounded-full flex items-center justify-center shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" strokeWidth={2} />
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {(selectedOrders.length > 0 || selectedEvents.length > 0) ? (
            <div className="space-y-3">
              {/* Events */}
              {selectedEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate(createPageUrl(`EventForm?id=${event.id}`))}
                  className="bg-white rounded-[20px] p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#52cfc1]/20 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-5 h-5 text-[#2d91a8]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#333333]">{event.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          event.type === 'Reunião' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                      {(event.start_time || event.end_time) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Clock className="w-3 h-3" />
                          {event.start_time} {event.end_time && `- ${event.end_time}`}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {event.location}
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
              className="bg-white rounded-[20px] p-8 text-center"
            >
              <p className="text-gray-400 text-sm">Nenhum compromisso para esta data</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
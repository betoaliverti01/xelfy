import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Check, FileText, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Orçamento':
      return 'bg-sky-950/80 text-sky-300 border-sky-800/40';
    case 'Pendente':
      return 'bg-amber-950/80 text-amber-300 border-amber-800/40';
    case 'Aprovado':
      return 'bg-teal-950/80 text-[#4BCBB4] border-[#34A8A6]/50';
    case 'Concluído':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40';
    case 'Cancelado':
      return 'bg-rose-950/80 text-rose-300 border-rose-800/40';
    default:
      return 'bg-[#081924] text-[#A3D2DF] border-[#1C4156]';
  }
};

export default function OrderCard({ order, onApprove, onGenerateReceipt, onShare, onClick }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), "dd 'de' MMM", { locale: ptBR });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-[#0D222E] rounded-2xl p-4 sm:p-5 shadow-sm border border-[#1C4156] hover:border-[#34A8A6]/60 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00485C] border border-[#34A8A6]/40 flex-shrink-0 shadow-sm">
            <span className="text-sm font-black text-white">
              {order.client_name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-sm sm:text-base truncate group-hover:text-[#4BCBB4] transition-colors">
              {order.client_name || 'Cliente'}
            </h4>
            <div className="flex items-center gap-1.5 text-[#A3D2DF] text-xs mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#8EB3BD]" strokeWidth={1.5} />
              <span>{formatDate(order.order_date)}</span>
              {order.id && (
                <span className="text-[10px] text-[#6E9AA6]">· #{order.id.slice(-6).toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>
        
        <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border flex-shrink-0 ${getStatusBadge(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#1C4156]/60">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8EB3BD] block">Total</span>
          <p className="text-base sm:text-lg font-black text-[#4BCBB4] tracking-tight">
            R$ {(order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {order.status === 'Orçamento' && (
            <button
              onClick={() => onApprove?.(order)}
              title="Aprovar Orçamento"
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 text-xs font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden xs:inline">Aprovar</span>
            </button>
          )}
          
          {(order.status === 'Concluído' || order.status === 'Orçamento') && (
            <button
              onClick={() => onGenerateReceipt?.(order)}
              title={order.status === 'Orçamento' ? 'Ver Orçamento' : 'Emitir Recibo'}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#133345] border border-[#1C4156] text-white hover:border-[#34A8A6] text-xs font-semibold rounded-xl active:scale-95 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-[#4BCBB4]" strokeWidth={2} />
              <span>{order.status === 'Orçamento' ? 'Ver' : 'Recibo'}</span>
            </button>
          )}
          
          <button
            onClick={() => onShare?.(order)}
            title="Compartilhar no WhatsApp"
            className="w-8 h-8 rounded-xl bg-[#081924] border border-[#1C4156] flex items-center justify-center text-[#A3D2DF] hover:text-white hover:border-[#34A8A6] transition-all"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
          
          <div className="text-[#6E9AA6] group-hover:text-white transition-colors pl-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Check, FileText, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors = {
  'Orçamento': 'bg-blue-100 text-blue-700',
  'Pendente': 'bg-amber-100 text-amber-700',
  'Aprovado': '',
  'Concluído': 'bg-green-100 text-green-700',
  'Cancelado': 'bg-red-100 text-red-700',
};

const getStatusStyle = (status) => {
  if (status === 'Aprovado') {
    return { backgroundColor: 'var(--color-primary)20', color: 'var(--color-primary)' };
  }
  return {};
};

export default function OrderCard({ order, onApprove, onGenerateReceipt, onShare, onClick }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), "dd MMM", { locale: ptBR });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: 'var(--color-secondary)40', borderColor: 'var(--color-primary)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
              {order.client_name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-[#333333] text-sm">{order.client_name || 'Cliente'}</h4>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Calendar className="w-3 h-3" strokeWidth={1.5} />
              <span>{formatDate(order.order_date)}</span>
            </div>
          </div>
        </div>
        <span 
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}
          style={getStatusStyle(order.status)}
        >
          {order.status}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-[#333333]">
          R$ {(order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        
        <div className="flex items-center gap-2">
          {order.status === 'Orçamento' && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove?.(order); }}
              style={{ backgroundColor: 'var(--color-primary)' }}
              className="flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              <Check className="w-3 h-3" />
              Aprovar
            </button>
          )}
          
          {(order.status === 'Concluído' || order.status === 'Orçamento') && (
            <button
              onClick={(e) => { e.stopPropagation(); onGenerateReceipt?.(order); }}
              style={{ backgroundColor: 'var(--color-secondary)40', color: 'var(--color-primary)' }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              <FileText className="w-3 h-3" />
              {order.status === 'Orçamento' ? 'Ver' : 'Recibo'}
            </button>
          )}
          
          <button
            onClick={(e) => { e.stopPropagation(); onShare?.(order); }}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
          </button>
          
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </div>
    </motion.div>
  );
}
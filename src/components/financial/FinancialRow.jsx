import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Calendar, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FinancialRow({ item, onClick }) {
    if (!item) return null;
    const isIncome = item.type === 'Receita';
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), "dd/MM/yy", { locale: ptBR });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isIncome ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {isIncome ? (
            <ArrowUpRight className="w-5 h-5 text-green-600" strokeWidth={1.5} />
          ) : (
            <ArrowDownRight className="w-5 h-5 text-red-500" strokeWidth={1.5} />
          )}
        </div>
        
        <div>
          <h4 className="font-medium text-[#333333] text-sm">{item.category}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(item.due_date)}</span>
            <span className={`px-2 py-0.5 rounded-full ${
              item.status === 'Pago' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {item.status}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <p className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'} R$ {(item.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        {item.description && (
          <p className="text-xs text-gray-400 truncate max-w-[120px]">{item.description}</p>
        )}
      </div>
    </motion.div>
  );
}
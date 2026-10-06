import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FinancialRow({ item, onClick }) {
  if (!item) return null;
  const isIncome = item.type === 'Receita';

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), "dd/MM/yy", { locale: ptBR });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-[#0D222E] rounded-2xl p-4 shadow-sm border border-[#1C4156] hover:border-[#34A8A6]/60 hover:shadow-md transition-all duration-200 flex items-center justify-between cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${
          isIncome 
            ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400' 
            : 'bg-rose-950/60 border-rose-800/40 text-rose-400'
        }`}>
          {isIncome ? (
            <ArrowUpRight className="w-5 h-5" strokeWidth={2} />
          ) : (
            <ArrowDownRight className="w-5 h-5" strokeWidth={2} />
          )}
        </div>
        
        <div className="min-w-0">
          <h4 className="font-bold text-white text-sm truncate group-hover:text-[#4BCBB4] transition-colors">
            {item.category || (isIncome ? 'Receita' : 'Despesa')}
          </h4>
          <div className="flex items-center gap-2 text-xs text-[#A3D2DF] mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#8EB3BD]" />
              {formatDate(item.due_date)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              item.status === 'Pago' 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40' 
                : 'bg-amber-950/80 text-amber-300 border-amber-800/40'
            }`}>
              {item.status}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-right flex-shrink-0 ml-3">
        <p className={`font-black text-sm sm:text-base ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isIncome ? '+' : '-'} R$ {(item.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        {item.description && (
          <p className="text-xs text-[#8EB3BD] truncate max-w-[140px] sm:max-w-[200px] mt-0.5">{item.description}</p>
        )}
      </div>
    </motion.div>
  );
}
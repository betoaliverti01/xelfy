import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FinancialCards({ toReceive, receivedThisMonth }) {
  const navigate = useNavigate();
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => navigate(createPageUrl('ToReceiveList'))}
        className="bg-white rounded-[20px] p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
          </div>
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        </div>
        <p className="text-xs text-gray-500 font-medium mb-1">A Receber</p>
        <p className="text-xl font-bold text-[#333333]">
          R$ {toReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate(createPageUrl(`FinancialList?type=received&month=${currentMonthKey}`))}
        className="bg-white rounded-[20px] p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)20' }}>
            <ArrowUpRight className="w-5 h-5" style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
          </div>
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        </div>
        <p className="text-xs text-gray-500 font-medium mb-1">Recebido no Mês</p>
        <p className="text-xl font-bold text-[#333333]">
          R$ {receivedThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </motion.div>
    </div>
  );
}
import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import FinancialRow from '@/components/financial/FinancialRow';

export default function FinancialList() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const filterType = urlParams.get('type'); // 'income', 'expense', 'receivable', 'received', 'profit'
  const filterMonth = urlParams.get('month'); // yyyy-MM format
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: financials = [], isLoading } = useQuery({
    queryKey: ['financials', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Financial.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  // Filter by month if specified
  let monthFiltered = financials;
  if (filterMonth) {
    const [year, month] = filterMonth.split('-').map(Number);
    monthFiltered = financials.filter(f => {
      if (!f.due_date) return false;
      const date = new Date(f.due_date);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    });
  }

  const filteredFinancials = monthFiltered.filter(f => {
    if (filterType === 'income') return f.type === 'Receita';
    if (filterType === 'expense') return f.type === 'Despesa';
    if (filterType === 'receivable') return f.type === 'Receita' && f.status === 'Aberto';
    if (filterType === 'received') return f.type === 'Receita' && f.status === 'Pago';
    if (filterType === 'profit') return true; // All items for profit calculation
    return true;
  });

  const total = filteredFinancials.reduce((sum, f) => {
    if (filterType === 'profit') {
      return sum + (f.type === 'Receita' ? (f.amount || 0) : -(f.amount || 0));
    }
    return sum + (f.amount || 0);
  }, 0);

  const getTitleAndStyle = () => {
    switch (filterType) {
      case 'income':
        return { title: 'Receitas', bgColor: 'bg-green-50', textColor: 'text-green-600', Icon: ArrowUpRight };
      case 'expense':
        return { title: 'Despesas', bgColor: 'bg-red-50', textColor: 'text-red-500', Icon: ArrowDownRight };
      case 'receivable':
        return { title: 'A Receber', bgColor: 'bg-amber-50', textColor: 'text-amber-600', Icon: ArrowUpRight };
      case 'received':
        return { title: 'Recebidos', bgColor: 'bg-green-50', textColor: 'text-green-600', Icon: ArrowUpRight };
      case 'profit':
        return { title: 'Balanço', bgColor: '', textColor: '', Icon: ArrowUpRight, usePrimary: true };
      default:
        return { title: 'Movimentações', bgColor: 'bg-gray-50', textColor: 'text-gray-600', Icon: ArrowUpRight };
    }
  };

  const { title, bgColor, textColor, Icon, usePrimary } = getTitleAndStyle();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">{title}</h1>
          <div className="w-10" />
        </div>

        {/* Total Card */}
        <div 
          className={`rounded-[20px] p-6 text-center ${!usePrimary ? bgColor : ''}`}
          style={usePrimary ? { backgroundColor: 'var(--color-primary)10' } : {}}
        >
          <Icon 
            className={`w-8 h-8 mx-auto mb-2 ${!usePrimary ? textColor : ''}`}
            style={usePrimary ? { color: 'var(--color-primary)' } : {}}
            strokeWidth={1.5} 
          />
          <p className="text-sm text-gray-500 mb-1">Total de {title}</p>
          <p 
            className={`text-3xl font-bold ${!usePrimary ? textColor : ''}`}
            style={usePrimary ? { color: 'var(--color-primary)' } : {}}
          >
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-2">{filteredFinancials.length} movimentações</p>
        </div>
      </div>

      {/* List */}
      <div className="px-5 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-[16px] p-4 animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-3 bg-gray-100 rounded" />
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredFinancials.length > 0 ? (
          filteredFinancials.map(item => (
            <FinancialRow
              key={item.id}
              item={item}
              onClick={() => navigate(createPageUrl(`FinancialForm?id=${item.id}`))}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[20px] p-12 text-center"
          >
            <Icon className={`w-16 h-16 ${textColor} opacity-40 mx-auto mb-4`} strokeWidth={1.5} />
            <p className="text-gray-400">Nenhuma movimentação encontrada</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
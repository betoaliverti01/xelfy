import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import usePullToRefresh from '@/components/utils/usePullToRefresh';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FinancialRow from '@/components/financial/FinancialRow';

export default function Financial() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { pullDistance, isRefreshing } = usePullToRefresh(() =>
    queryClient.invalidateQueries(['financials'])
  );

  const { data: financials = [], isLoading } = useQuery({
    queryKey: ['financials', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Financial.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const previousMonthStart = startOfMonth(subMonths(currentMonth, 1));
  const previousMonthEnd = endOfMonth(subMonths(currentMonth, 1));

  const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));
  const nextMonthEnd = endOfMonth(addMonths(currentMonth, 1));

  const getMonthlyData = (start, end) => {
    const monthFinancials = financials.filter(f => {
      const dueDate = new Date(f.due_date);
      return dueDate >= start && dueDate <= end;
    });

    const income = monthFinancials.filter(f => f.type === 'Receita').reduce((sum, f) => sum + (f.amount || 0), 0);
    const expenses = monthFinancials.filter(f => f.type === 'Despesa').reduce((sum, f) => sum + (f.amount || 0), 0);
    const profit = income - expenses;

    return { income, expenses, profit };
  };

  const previousMonth = getMonthlyData(previousMonthStart, previousMonthEnd);
  const currentMonthData = getMonthlyData(monthStart, monthEnd);
  const nextMonth = getMonthlyData(nextMonthStart, nextMonthEnd);

  const monthlyFinancials = financials.filter(f => {
    const dueDate = new Date(f.due_date);
    return dueDate >= monthStart && dueDate <= monthEnd;
  });

  const totalIncome = currentMonthData.income;
  const totalExpenses = currentMonthData.expenses;
  const estimatedProfit = currentMonthData.profit;

  return (
    <div className="min-h-screen bg-[#07151D] text-[#E5F3F7] pb-12">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: isRefreshing ? 44 : pullDistance * 0.55 }}
        >
          <RefreshCw
            className={`w-5 h-5 text-[#34A8A6] ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ opacity: Math.min(pullDistance / 80, 1) }}
          />
        </div>
      )}
      {/* Header */}
      <div className="bg-[#0D222E] border-b border-[#1C4156] px-4 sm:px-6 lg:px-8 pt-8 pb-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Controle Financeiro</h1>
              <p className="text-xs text-[#A3D2DF]">Fluxo de caixa, receitas e despesas</p>
            </div>
            
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* Month Selector */}
              <div className="flex items-center gap-2 bg-[#081924] border border-[#1C4156] rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A3D2DF] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm font-bold text-white min-w-[120px] text-center capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A3D2DF] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Link
                to={createPageUrl('FinancialForm')}
                className="h-10 px-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>Lançamento</span>
              </Link>
            </div>
          </div>

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(createPageUrl('FinancialList?type=income'))}
              className="bg-[#081924] border border-emerald-900/40 hover:border-emerald-500/50 rounded-2xl p-4 text-center cursor-pointer transition-all shadow-sm group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center mx-auto mb-2 text-emerald-400 group-hover:scale-105 transition-transform">
                <ArrowUpRight className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold text-[#8EB3BD] mb-1">Receitas</p>
              <p className="text-base sm:text-lg font-black text-emerald-400">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => navigate(createPageUrl('FinancialList?type=expense'))}
              className="bg-[#081924] border border-rose-900/40 hover:border-rose-500/50 rounded-2xl p-4 text-center cursor-pointer transition-all shadow-sm group"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center mx-auto mb-2 text-rose-400 group-hover:scale-105 transition-transform">
                <ArrowDownRight className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold text-[#8EB3BD] mb-1">Despesas</p>
              <p className="text-base sm:text-lg font-black text-rose-400">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#081924] border border-[#1C4156] rounded-2xl p-4 text-center shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 border ${
                estimatedProfit >= 0 
                  ? 'bg-teal-950/60 border-[#34A8A6]/40 text-[#4BCBB4]' 
                  : 'bg-amber-950/60 border-amber-800/40 text-amber-400'
              }`}>
                <TrendingUp className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold text-[#8EB3BD] mb-1">Resultado Líquido</p>
              <p className={`text-base sm:text-lg font-black ${estimatedProfit >= 0 ? 'text-[#4BCBB4]' : 'text-amber-400'}`}>
                R$ {estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>
          </div>

          {/* Profit Comparison Horizontal Bar */}
          <div className="bg-[#081924] rounded-2xl p-4 border border-[#1C4156]">
            <p className="text-xs font-bold text-[#A3D2DF] uppercase tracking-wider mb-3">Comparativo de Períodos</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-[10px] text-[#8EB3BD] mb-0.5">Mês Anterior</p>
                <p className={`text-xs sm:text-sm font-bold ${previousMonth.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  R$ {Math.abs(previousMonth.profit).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-center border-x border-[#1C4156] px-2">
                <p className="text-[10px] text-[#A3D2DF] font-bold mb-0.5">Mês Atual</p>
                <p className={`text-sm sm:text-base font-black ${estimatedProfit >= 0 ? 'text-[#4BCBB4]' : 'text-amber-400'}`}>
                  R$ {Math.abs(estimatedProfit).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[#8EB3BD] mb-0.5">Próximo Mês</p>
                <p className={`text-xs sm:text-sm font-bold ${nextMonth.profit >= 0 ? 'text-emerald-400' : 'text-[#8EB3BD]'}`}>
                  R$ {Math.abs(nextMonth.profit).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List - 2 Columns on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-white">Movimentações do Mês ({monthlyFinancials.length})</h2>
        </div>
        
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#0D222E] border border-[#1C4156] rounded-2xl p-4 animate-pulse flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#133345]" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-4 bg-[#133345] rounded" />
                    <div className="w-16 h-3 bg-[#133345] rounded" />
                  </div>
                  <div className="w-20 h-5 bg-[#133345] rounded" />
                </div>
              ))}
            </div>
          ) : monthlyFinancials.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {monthlyFinancials.map(item => (
                <FinancialRow
                  key={item.id}
                  item={item}
                  onClick={() => navigate(createPageUrl(`FinancialForm?id=${item.id}`))}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0D222E] border border-[#1C4156] rounded-2xl p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#081924] border border-[#1C4156]">
                <TrendingUp className="w-8 h-8 text-[#4BCBB4]" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-white mb-1">Nenhuma movimentação neste mês</h3>
              <p className="text-sm text-[#A3D2DF]">Adicione receitas ou despesas para acompanhar o fluxo de caixa.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
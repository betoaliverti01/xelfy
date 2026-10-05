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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: isRefreshing ? 44 : pullDistance * 0.55 }}
        >
          <RefreshCw
            className={`w-5 h-5 text-[#2d91a8] ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ opacity: Math.min(pullDistance / 80, 1) }}
          />
        </div>
      )}
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 rounded-b-[32px] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#333333]">Financeiro</h1>
          <Link
            to={createPageUrl('FinancialForm')}
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2} />
          </Link>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-[#333333] min-w-[140px] text-center capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(createPageUrl('FinancialList?type=income'))}
            className="bg-green-50 rounded-[16px] p-4 text-center cursor-pointer hover:bg-green-100 transition-colors"
          >
            <ArrowUpRight className="w-5 h-5 text-green-600 mx-auto mb-1" strokeWidth={1.5} />
            <p className="text-xs text-gray-500 mb-1">Receitas</p>
            <p className="text-sm font-bold text-green-600">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate(createPageUrl('FinancialList?type=expense'))}
            className="bg-red-50 rounded-[16px] p-4 text-center cursor-pointer hover:bg-red-100 transition-colors"
          >
            <ArrowDownRight className="w-5 h-5 text-red-500 mx-auto mb-1" strokeWidth={1.5} />
            <p className="text-xs text-gray-500 mb-1">Despesas</p>
            <p className="text-sm font-bold text-red-500">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-[16px] p-4 text-center`}
            style={estimatedProfit >= 0 ? { backgroundColor: 'var(--color-primary)10' } : {}}
          >
            <TrendingUp 
              className={`w-5 h-5 mx-auto mb-1 ${estimatedProfit >= 0 ? '' : 'text-amber-600'}`}
              style={estimatedProfit >= 0 ? { color: 'var(--color-primary)' } : {}}
              strokeWidth={1.5} 
            />
            <p className="text-xs text-gray-500 mb-1">Lucro</p>
            <p 
              className={`text-sm font-bold ${estimatedProfit >= 0 ? '' : 'text-amber-600'}`}
              style={estimatedProfit >= 0 ? { color: 'var(--color-primary)' } : {}}
            >
              R$ {estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>
        </div>

        {/* Profit Comparison */}
        <div className="bg-white rounded-[16px] p-4 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-3">Comparação de Lucro</p>
          <div className="flex items-center justify-between gap-2">
            <div className="text-center flex-1">
              <p className="text-[10px] text-gray-400 mb-1">Mês Anterior</p>
              <p className={`text-sm font-bold ${previousMonth.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                R$ {Math.abs(previousMonth.profit).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-center flex-1 px-2 border-x border-gray-100">
              <p className="text-[10px] text-gray-400 mb-1">Mês Atual</p>
              <p 
                className={`text-lg font-bold ${estimatedProfit >= 0 ? '' : 'text-amber-600'}`}
                style={estimatedProfit >= 0 ? { color: 'var(--color-primary)' } : {}}
              >
                R$ {Math.abs(estimatedProfit).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] text-gray-400 mb-1">Próximo Mês</p>
              <p 
                className={`text-sm font-bold ${nextMonth.profit >= 0 ? '' : 'text-gray-400'}`}
                style={nextMonth.profit >= 0 ? { color: 'var(--color-primary)' } : {}}
              >
                R$ {Math.abs(nextMonth.profit).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-5 py-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">Movimentações</h2>
        
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
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
          ) : monthlyFinancials.length > 0 ? (
            monthlyFinancials.map(item => (
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
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-secondary)20' }}>
                <TrendingUp className="w-8 h-8" style={{ color: 'var(--color-primary)66' }} strokeWidth={1.5} />
              </div>
              <p className="text-gray-400">Nenhuma movimentação neste mês</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
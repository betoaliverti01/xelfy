import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import FinancialRow from '@/components/financial/FinancialRow';

export default function ToReceiveList() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: toReceive = [], isLoading, error } = useQuery({
    queryKey: ['financialsToReceive', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const financials = await base44.entities.Financial.filter(
        { created_by: user.email, type: 'Receita', status: 'Aberto' }
      );
      return financials.sort((a, b) => {
        const dateA = a.due_date ? new Date(a.due_date) : new Date(0);
        const dateB = b.due_date ? new Date(b.due_date) : new Date(0);
        return dateA - dateB;
      });
    },
    enabled: !!user?.email,
  });

  const totalToReceive = toReceive.reduce((sum, f) => sum + (f.amount || 0), 0);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Erro ao carregar dados</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#2d91a8]">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">A Receber</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Summary Card */}
      <div className="px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-[20px] p-6 shadow-sm"
        >
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
          </div>
          <p className="text-center text-sm text-gray-600 mb-2">Total a Receber</p>
          <p className="text-center text-3xl font-bold text-[#333333]">
            R$ {totalToReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            {toReceive.length} {toReceive.length === 1 ? 'movimentação' : 'movimentações'}
          </p>
        </motion.div>

        {/* Financial List */}
        <div className="mt-6 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))
          ) : toReceive.length > 0 ? (
            toReceive.filter(Boolean).map((financial) => (
              <FinancialRow key={financial.id} item={financial} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[20px] p-8 text-center"
            >
              <p className="text-gray-400">Nenhum valor a receber</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
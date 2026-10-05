import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, Building, Coins, CreditCard, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const iconMap = { Wallet, Building, Coins, CreditCard };

export default function AccountsOverview({ user }) {
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Account.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[24px] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm text-gray-500 font-medium">Saldo Total</h3>
          <p className="text-2xl font-bold text-[#333333]">
            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Link
          to={createPageUrl('AccountList')}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)10' }}
        >
          <Plus className="w-5 h-5" style={{ color: 'var(--color-primary)' }} strokeWidth={2} />
        </Link>
      </div>

      <div className="space-y-2">
        {accounts.slice(0, 3).map(account => {
          const IconComponent = iconMap[account.icon] || Wallet;
          return (
            <Link
              key={account.id}
              to={createPageUrl(`AccountForm?id=${account.id}`)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${account.color}20` }}
                >
                  <IconComponent className="w-5 h-5" style={{ color: account.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-[#333333] text-sm">{account.name}</p>
                  <p className="text-xs text-gray-400">{account.type}</p>
                </div>
              </div>
              <p className="font-semibold text-[#333333]">
                R$ {(account.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </Link>
          );
        })}
        {accounts.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-3">Nenhuma conta cadastrada</p>
        )}
      </div>
    </motion.div>
  );
}
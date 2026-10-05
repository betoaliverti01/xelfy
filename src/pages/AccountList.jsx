import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Wallet, Building, Coins, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const iconMap = {
  Wallet,
  Building,
  Coins,
  CreditCard,
};

export default function AccountList() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Account.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-bold text-[#333333]">Contas</h1>
          <Link to={createPageUrl('AccountForm')} className="w-10 h-10 bg-[#4A5D23] rounded-full flex items-center justify-center shadow-lg">
            <Plus className="w-5 h-5 text-white" strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[20px] p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded" />
                    <div className="w-16 h-3 bg-gray-100 rounded" />
                  </div>
                  <div className="w-20 h-5 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : accounts.length > 0 ? (
          accounts.map(account => {
            const IconComponent = iconMap[account.icon] || Wallet;
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[20px] p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(createPageUrl(`AccountForm?id=${account.id}`))}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: account.color }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#333333]">{account.name}</h3>
                    <p className="text-xs text-gray-400">{account.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#333333]">
                      R$ {(account.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[20px] p-12 text-center">
            <div className="w-16 h-16 bg-[#F5F5DC] rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-[#4A5D23]/40" strokeWidth={1.5} />
            </div>
            <p className="text-gray-400">Nenhuma conta cadastrada</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
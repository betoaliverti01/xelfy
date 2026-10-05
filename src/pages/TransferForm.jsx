import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, ArrowRightLeft, Wallet, Building, Coins, CreditCard, X } from 'lucide-react';
import { format } from 'date-fns';

const iconMap = { Wallet, Building, Coins, CreditCard };

export default function TransferForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    from_account_id: '',
    from_account_name: '',
    to_account_id: '',
    to_account_name: '',
    amount: '',
    transfer_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Account.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const handleSelectFromAccount = (account) => {
    setFormData({ ...formData, from_account_id: account.id, from_account_name: account.name });
    setShowFromModal(false);
  };

  const handleSelectToAccount = (account) => {
    setFormData({ ...formData, to_account_id: account.id, to_account_name: account.name });
    setShowToModal(false);
  };

  const handleSave = async () => {
    if (!formData.from_account_id || !formData.to_account_id || !formData.amount) return;
    if (formData.from_account_id === formData.to_account_id) {
      alert('A conta de origem deve ser diferente da conta de destino');
      return;
    }

    setIsSaving(true);
    try {
      const amount = parseFloat(formData.amount);

      // Create transfer record
      await base44.entities.Transfer.create(formData);

      // Update account balances
      const fromAccount = accounts.find(a => a.id === formData.from_account_id);
      const toAccount = accounts.find(a => a.id === formData.to_account_id);

      await base44.entities.Account.update(formData.from_account_id, {
        balance: fromAccount.balance - amount,
      });

      await base44.entities.Account.update(formData.to_account_id, {
        balance: toAccount.balance + amount,
      });

      queryClient.invalidateQueries(['accounts']);
      queryClient.invalidateQueries(['transfers']);
      navigate(createPageUrl('AccountList'));
    } finally {
      setIsSaving(false);
    }
  };

  const fromAccount = accounts.find(a => a.id === formData.from_account_id);
  const toAccount = accounts.find(a => a.id === formData.to_account_id);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">Transferência</h1>
          <div className="w-10" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 space-y-4">
        {/* From Account */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">De *</label>
          <button onClick={() => setShowFromModal(true)} className="w-full flex items-center gap-3 text-left">
            {fromAccount ? (
              <>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${fromAccount.color}20` }}
                >
                  {React.createElement(iconMap[fromAccount.icon] || Wallet, {
                    className: "w-5 h-5",
                    style: { color: fromAccount.color },
                    strokeWidth: 1.5
                  })}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#333333]">{fromAccount.name}</p>
                  <p className="text-xs text-gray-400">Saldo: R$ {fromAccount.balance?.toFixed(2)}</p>
                </div>
              </>
            ) : (
              <span className="text-gray-400">Selecionar conta de origem</span>
            )}
          </button>
        </div>

        {/* Transfer Icon */}
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-[#4A5D23]/10 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-[#4A5D23]" strokeWidth={1.5} />
          </div>
        </div>

        {/* To Account */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Para *</label>
          <button onClick={() => setShowToModal(true)} className="w-full flex items-center gap-3 text-left">
            {toAccount ? (
              <>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${toAccount.color}20` }}
                >
                  {React.createElement(iconMap[toAccount.icon] || Wallet, {
                    className: "w-5 h-5",
                    style: { color: toAccount.color },
                    strokeWidth: 1.5
                  })}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#333333]">{toAccount.name}</p>
                  <p className="text-xs text-gray-400">Saldo: R$ {toAccount.balance?.toFixed(2)}</p>
                </div>
              </>
            ) : (
              <span className="text-gray-400">Selecionar conta de destino</span>
            )}
          </button>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Valor *</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">R$</span>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0,00"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Data</label>
          <input
            type="date"
            value={formData.transfer_date}
            onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Motivo da transferência..."
            rows={2}
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={!formData.from_account_id || !formData.to_account_id || !formData.amount || isSaving}
            className="w-full py-4 bg-[#4A5D23] text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Confirmar Transferência
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* From Account Modal */}
      <AnimatePresence>
        {showFromModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowFromModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-[32px] w-full max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Conta de Origem</h2>
                  <button onClick={() => setShowFromModal(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-5 space-y-2">
                {accounts.map(account => {
                  const IconComponent = iconMap[account.icon] || Wallet;
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleSelectFromAccount(account)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: account.color }} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-[#333333]">{account.name}</p>
                        <p className="text-xs text-gray-400">R$ {account.balance?.toFixed(2)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* To Account Modal */}
      <AnimatePresence>
        {showToModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowToModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-[32px] w-full max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Conta de Destino</h2>
                  <button onClick={() => setShowToModal(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-5 space-y-2">
                {accounts.map(account => {
                  const IconComponent = iconMap[account.icon] || Wallet;
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleSelectToAccount(account)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: account.color }} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-[#333333]">{account.name}</p>
                        <p className="text-xs text-gray-400">R$ {account.balance?.toFixed(2)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
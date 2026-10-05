import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Trash2, DollarSign, Tag, Calendar, FileText, ArrowUpRight, ArrowDownRight, Wallet, Building, Coins, CreditCard, X, Receipt } from 'lucide-react';
import { format } from 'date-fns';

const iconMap = { Wallet, Building, Coins, CreditCard };

const defaultCategories = [
  'Venda',
  'Aluguel',
  'Água',
  'Luz',
  'Internet',
  'Material',
  'Fornecedor',
  'Transporte',
  'Marketing',
];

export default function FinancialForm() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Receita',
    amount: '',
    category: 'Venda',
    status: 'Aberto',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    payment_date: '',
    description: '',
    account_id: '',
    account_name: '',
    order_id: '',
  });

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [user, setUser] = React.useState(null);
  const [orderIdFromFinancial, setOrderIdFromFinancial] = useState(null);
  const [customCategory, setCustomCategory] = useState('');
  const [categories, setCategories] = useState(defaultCategories);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: order } = useQuery({
    queryKey: ['order', orderIdFromFinancial],
    queryFn: async () => {
      if (!orderIdFromFinancial) return null;
      const orders = await base44.entities.Order.list();
      return orders.find(o => o.id === orderIdFromFinancial);
    },
    enabled: !!orderIdFromFinancial,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Account.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (itemId) {
      setIsLoading(true);
      base44.entities.Financial.list()
        .then(items => {
          const item = items.find(i => i.id === itemId);
          if (item) {
            setFormData({
              name: item.name || '',
              type: item.type || 'Receita',
              amount: item.amount?.toString() || '',
              category: item.category || 'Venda',
              status: item.status || 'Aberto',
              due_date: item.due_date || '',
              payment_date: item.payment_date || '',
              description: item.description || '',
              account_id: item.account_id || '',
              account_name: item.account_name || '',
              order_id: item.order_id || '',
            });
            if (item.order_id) {
              setOrderIdFromFinancial(item.order_id);
            }
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [itemId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const amount = parseFloat(formData.amount) || 0;
      const data = {
        ...formData,
        amount,
      };
      
      if (itemId) {
        await base44.entities.Financial.update(itemId, data);
      } else {
        await base44.entities.Financial.create(data);
      }

      // Update account balance if account is selected and status is paid
      if (formData.account_id && formData.status === 'Pago') {
        const account = accounts.find(a => a.id === formData.account_id);
        if (account) {
          const newBalance = formData.type === 'Receita'
            ? account.balance + amount
            : account.balance - amount;
          await base44.entities.Account.update(formData.account_id, { balance: newBalance });
        }
      }
      
      navigate(createPageUrl('Financial'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAccount = (account) => {
    setFormData({ ...formData, account_id: account.id, account_name: account.name });
    setShowAccountModal(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Deseja realmente excluir esta movimentação?')) {
      await base44.entities.Financial.delete(itemId);
      navigate(createPageUrl('Financial'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2d91a8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm print:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">
            {itemId ? 'Editar Movimentação' : 'Nova Movimentação'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 space-y-4"
      >
        {/* Type Selector */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Tipo *</label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({ ...formData, type: 'Receita' })}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.type === 'Receita'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Receita
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: 'Despesa' })}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.type === 'Despesa'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Despesa
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Nome</label>
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Pagamento João Silva"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Valor *</label>
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0,00"
              className="flex-1 text-[#333333] text-lg font-semibold bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Categoria *</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.category === cat
                    ? 'bg-[#2d91a8] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Nova categoria..."
              className="flex-1 px-4 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20"
            />
            <button
              onClick={() => {
                if (customCategory.trim()) {
                  setCategories([...categories, customCategory.trim()]);
                  setFormData({ ...formData, category: customCategory.trim() });
                  setCustomCategory('');
                }
              }}
              disabled={!customCategory.trim()}
              className="px-4 py-2 bg-[#2d91a8] text-white rounded-full text-sm font-medium disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Status</label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({ ...formData, status: 'Aberto' })}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                formData.status === 'Aberto'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              Aberto
            </button>
            <button
              onClick={() => setFormData({ ...formData, status: 'Pago', payment_date: format(new Date(), 'yyyy-MM-dd') })}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                formData.status === 'Pago'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              Pago
            </button>
          </div>
        </div>

        {/* Due Date */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Data de Vencimento</label>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Payment Date - Only if Paid */}
        {formData.status === 'Pago' && (
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Data de Pagamento</label>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Account Selection */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Conta *</label>
          <button onClick={() => setShowAccountModal(true)} className="w-full flex items-center gap-3 text-left">
            {formData.account_id ? (
              <>
                {(() => {
                  const account = accounts.find(a => a.id === formData.account_id);
                  if (!account) return <span className="text-gray-400">Selecionar conta</span>;
                  const IconComponent = iconMap[account.icon] || Wallet;
                  return (
                    <>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: account.color }} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#333333]">{account.name}</p>
                        <p className="text-xs text-gray-400">Saldo: R$ {account.balance?.toFixed(2)}</p>
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <span className="text-gray-400">Selecionar conta</span>
            )}
          </button>
        </div>

        {/* Description */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Descrição</label>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Observações..."
              rows={3}
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={!formData.amount || isSaving}
            className="w-full py-4 bg-[#2d91a8] text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" strokeWidth={1.5} />
                Salvar
              </>
            )}
          </button>

          {itemId && formData.type === 'Receita' && formData.status === 'Pago' && formData.order_id && order && (
            <button
              onClick={() => navigate(createPageUrl(`Receipt?id=${order.id}`))}
              className="w-full py-4 bg-blue-50 text-blue-500 font-semibold rounded-[20px] flex items-center justify-center gap-2"
            >
              <Receipt className="w-5 h-5" strokeWidth={1.5} />
              Gerar Recibo
            </button>
          )}

          {itemId && (
            <button
              onClick={handleDelete}
              className="w-full py-4 bg-red-50 text-red-500 font-semibold rounded-[20px] flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              Excluir
            </button>
          )}
        </div>
      </motion.div>

      {/* Account Modal */}
      <AnimatePresence>
        {showAccountModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowAccountModal(false)}
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
                  <h2 className="font-bold text-lg">Selecionar Conta</h2>
                  <button onClick={() => setShowAccountModal(false)}>
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
                      onClick={() => handleSelectAccount(account)}
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
                {accounts.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">Nenhuma conta cadastrada</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
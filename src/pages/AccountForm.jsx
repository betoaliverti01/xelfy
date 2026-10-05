import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Wallet, Building, Coins, CreditCard, Plus } from 'lucide-react';

const iconOptions = [
  { name: 'Wallet', icon: Wallet, label: 'Carteira' },
  { name: 'Building', icon: Building, label: 'Banco' },
  { name: 'Coins', icon: Coins, label: 'Cofrinho' },
  { name: 'CreditCard', icon: CreditCard, label: 'Cartão' },
];

const colorOptions = [
  '#4A5D23', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'
];

export default function AccountForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const accountId = urlParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Caixa',
    balance: '0',
    color: '#4A5D23',
    icon: 'Wallet',
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (accountId) {
      setIsLoading(true);
      base44.entities.Account.list()
        .then(accounts => {
          const account = accounts.find(a => a.id === accountId);
          if (account) {
            setFormData({
              name: account.name || '',
              type: account.type || 'Caixa',
              balance: account.balance?.toString() || '0',
              color: account.color || '#4A5D23',
              icon: account.icon || 'Wallet',
            });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [accountId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance) || 0,
        color: formData.color,
        icon: formData.icon,
      };
      
      if (accountId) {
        await base44.entities.Account.update(accountId, data);
      } else {
        await base44.entities.Account.create(data);
      }
      
      queryClient.invalidateQueries(['accounts']);
      navigate(createPageUrl('AccountList'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Deseja realmente excluir esta conta?')) {
      await base44.entities.Account.delete(accountId);
      queryClient.invalidateQueries(['accounts']);
      navigate(createPageUrl('AccountList'));
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
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">
            {accountId ? 'Editar Conta' : 'Nova Conta'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 space-y-4">
        {/* Name */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Nome da Conta *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Caixa Principal"
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none"
          />
        </div>

        {/* Type */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Tipo *</label>
          <div className="grid grid-cols-3 gap-2">
            {['Caixa', 'Banco', 'Cofrinho', 'Carteira', 'Outra'].map(type => (
              <button
                key={type}
                onClick={() => setFormData({ ...formData, type })}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  formData.type === type ? 'bg-[#2d91a8] text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Saldo Inicial</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">R$</span>
            <input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Icon */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Ícone</label>
          <div className="flex gap-3">
            {iconOptions.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setFormData({ ...formData, icon: name })}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  formData.icon === name ? 'bg-[#2d91a8] text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Cor</label>
          <div className="flex gap-2 flex-wrap">
            {colorOptions.map(color => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-full transition-all ${
                  formData.color === color ? 'ring-2 ring-offset-2 ring-[#2d91a8]' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={!formData.name || isSaving}
            className="w-full py-4 bg-[#2d91a8] text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Conta
              </>
            )}
          </button>

          {accountId && (
            <button onClick={handleDelete} className="w-full py-4 bg-red-50 text-red-500 font-semibold rounded-[20px] flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              Excluir Conta
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
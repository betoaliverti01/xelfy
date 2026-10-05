import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { X, UserPlus, ShoppingBag, Package, Wallet, Tag } from 'lucide-react';

const quickActions = [
  { icon: UserPlus, label: 'Novo Cliente', page: 'ClientForm', color: 'bg-blue-500', lightColor: 'bg-blue-50' },
  { icon: ShoppingBag, label: 'Novo Pedido', page: 'OrderForm', color: 'bg-purple-500', lightColor: 'bg-purple-50' },
  { icon: Package, label: 'Novo Item', page: 'CatalogForm', color: 'bg-amber-500', lightColor: 'bg-amber-50' },
  { icon: Package, label: 'Inventário', page: 'InventoryForm', color: 'bg-orange-500', lightColor: 'bg-orange-50' },
  { icon: Wallet, label: 'Nova Movimentação', page: 'FinancialForm', color: 'bg-green-500', lightColor: 'bg-green-50' },
  { icon: Wallet, label: 'Nova Conta', page: 'AccountForm', color: 'bg-indigo-500', lightColor: 'bg-indigo-50' },
  { icon: Wallet, label: 'Transferência', page: 'TransferForm', color: 'bg-pink-500', lightColor: 'bg-pink-50' },
  { icon: Tag, label: 'Categoria', page: 'CategoryManager', color: 'bg-rose-500', lightColor: 'bg-rose-50' },
];

export default function QuickAdd() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#FAFAFA] flex flex-col"
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#333333]">Novo Cadastro</h1>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="flex-1 px-5 py-6">
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={createPageUrl(action.page)}
                className="block bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className={`w-14 h-14 ${action.lightColor} rounded-2xl flex items-center justify-center mb-4`}>
                  <action.icon className={`w-7 h-7 ${action.color.replace('bg-', 'text-')}`} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-[#333333] text-sm">{action.label}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom FAB to go back */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => navigate(-1)}
          className="w-14 h-14 bg-[#2d91a8] rounded-full flex items-center justify-center shadow-lg shadow-[#2d91a8]/30"
        >
          <X className="w-6 h-6 text-white" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}
import React from 'react';
import { UserPlus, Settings, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function QuickActions() {
  const actions = [
    { icon: UserPlus, label: 'Novo Cliente', page: 'ClientForm', color: 'bg-blue-500', textColor: 'text-white' },
    { icon: Package, label: 'Estoque', page: 'InventoryList', color: 'bg-amber-500', textColor: 'text-white' },
    { icon: Settings, label: 'Personalizar', page: 'AppCustomization', color: 'bg-purple-500', textColor: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
        >
          <Link
            to={createPageUrl(action.page)}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-sm`}>
              <action.icon className={`w-6 h-6 ${action.textColor}`} strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[#333333] font-medium text-center">{action.label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
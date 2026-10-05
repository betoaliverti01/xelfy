import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Search, Package, AlertCircle } from 'lucide-react';

export default function InventoryList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Inventory.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const filteredInventory = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">Estoque</h1>
          <button
            onClick={() => navigate(createPageUrl('InventoryForm'))}
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar item..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="bg-white rounded-[20px] p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nenhum item no estoque</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInventory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(createPageUrl(`InventoryForm?id=${item.id}`))}
                className="bg-white rounded-[20px] p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#333333]">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-500">
                        Estoque: <strong>{item.quantity} {item.unit}</strong>
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                        R$ {item.unit_cost?.toFixed(2)}/{item.unit}
                      </span>
                    </div>
                    {item.quantity <= item.min_quantity && (
                      <div className="flex items-center gap-1 mt-2 text-red-500 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>Estoque baixo!</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
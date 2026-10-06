import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen bg-[#07151D] text-[#E5F3F7] pb-12">
      {/* Header */}
      <div className="bg-[#0D222E] border-b border-[#1C4156] px-4 sm:px-6 lg:px-8 pt-8 pb-5 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <div className="text-center">
              <h1 className="text-lg sm:text-xl font-black text-white">Controle de Estoque</h1>
              <p className="text-xs text-[#A3D2DF]">{filteredInventory.length} item(ns) cadastrados</p>
            </div>
            <button
              onClick={() => navigate(createPageUrl('InventoryForm'))}
              className="h-9 px-3 rounded-xl bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Novo</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8EB3BD]" strokeWidth={2} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar item no estoque..."
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#081924] border border-[#1C4156] text-white placeholder-[#6E9AA6] rounded-xl text-sm focus:outline-none focus:border-[#34A8A6] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Content - Multi-column horizontal desktop display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#0D222E] border border-[#1C4156] rounded-2xl p-4 animate-pulse space-y-3">
                  <div className="w-3/4 h-5 bg-[#133345] rounded" />
                  <div className="w-1/2 h-4 bg-[#133345] rounded" />
                </div>
              ))}
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="bg-[#0D222E] border border-[#1C4156] rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#081924] border border-[#1C4156]">
                <Package className="w-8 h-8 text-[#4BCBB4]" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-white mb-1">Nenhum item no estoque</h3>
              <p className="text-sm text-[#A3D2DF]">Cadastre matérias-primas e produtos para controlar saldo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredInventory.map((item) => {
                const isLowStock = item.quantity <= (item.min_quantity || 0);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(createPageUrl(`InventoryForm?id=${item.id}`))}
                    className="group bg-[#0D222E] rounded-2xl p-4 sm:p-5 shadow-sm border border-[#1C4156] hover:border-[#34A8A6]/60 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-white text-base truncate group-hover:text-[#4BCBB4] transition-colors">
                          {item.name}
                        </h3>
                        {isLowStock && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/40 flex-shrink-0">
                            <AlertCircle className="w-3 h-3" />
                            Baixo
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-[#A3D2DF] line-clamp-2 mb-3">{item.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#1C4156]/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8EB3BD] block">Saldo</span>
                        <p className="text-sm sm:text-base font-black text-white">
                          {item.quantity} <span className="text-xs font-normal text-[#A3D2DF]">{item.unit || 'un'}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#8EB3BD] block">Custo Unitário</span>
                        <p className="text-sm sm:text-base font-black text-[#4BCBB4]">
                          R$ {(item.unit_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
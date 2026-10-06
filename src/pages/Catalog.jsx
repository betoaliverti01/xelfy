import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import usePullToRefresh from '@/components/utils/usePullToRefresh';
import { Search, Plus, Package, Wrench, Globe, Grid3x3, List, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CatalogCard from '@/components/catalog/CatalogCard';

export default function Catalog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('catalogViewMode') || 'grid';
  });
  const [user, setUser] = React.useState(null);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('catalogViewMode', mode);
  };

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { pullDistance, isRefreshing } = usePullToRefresh(() =>
    queryClient.invalidateQueries(['catalog'])
  );

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['catalog', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.CatalogItem.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const { data: store = [] } = useQuery({
    queryKey: ['onlineStore', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.OnlineStore.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: appSettings = [] } = useQuery({
    queryKey: ['appSettings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.AppSettings.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const primaryColor = appSettings[0]?.primary_color || '#2d91a8';

  const handlePublishStore = () => {
    navigate(createPageUrl('StoreSettings'));
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'product') return item.type === 'Produto' && matchesSearch;
    if (filter === 'service') return item.type === 'Serviço' && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#07151D] text-[#E5F3F7] pb-12">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: isRefreshing ? 44 : pullDistance * 0.55 }}
        >
          <RefreshCw
            className={`w-5 h-5 text-[#34A8A6] ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ opacity: Math.min(pullDistance / 80, 1) }}
          />
        </div>
      )}
      {/* Header */}
      <div className="bg-[#0D222E] border-b border-[#1C4156] px-4 sm:px-6 lg:px-8 pt-8 pb-5 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Catálogo</h1>
              <p className="text-xs text-[#A3D2DF]">Gerencie seus produtos e serviços</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-[#081924] border border-[#1C4156] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => handleViewModeChange('grid')}
                  title="Visualização em Grade"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'grid' ? 'bg-[#00485C] text-white shadow-sm' : 'text-[#8EB3BD] hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange('list')}
                  title="Visualização em Lista"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'list' ? 'bg-[#00485C] text-white shadow-sm' : 'text-[#8EB3BD] hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <button
                type="button"
                onClick={handlePublishStore}
                className="h-9 sm:h-10 px-3.5 rounded-xl flex items-center justify-center gap-2 bg-[#133345] border border-[#1C4156] text-white hover:border-[#34A8A6] transition-all text-xs sm:text-sm font-semibold shadow-sm"
              >
                <Globe className="w-4 h-4 text-[#4BCBB4]" strokeWidth={2} />
                <span>Loja Online</span>
              </button>

              <Link
                to={createPageUrl('CatalogForm')}
                className="h-9 sm:h-10 px-3.5 rounded-xl flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span className="hidden xs:inline">Adicionar</span>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3.5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8EB3BD]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar produtos ou serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#081924] border border-[#1C4156] text-white placeholder-[#6E9AA6] rounded-xl text-sm focus:outline-none focus:border-[#34A8A6] transition-colors"
            />
          </div>

          {/* Filter Buttons with safe horizontal scroll to avoid page overflow */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar -mx-1 px-1">
            <button
              onClick={() => setFilter('all')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold shadow-md'
                  : 'bg-[#081924] text-[#A3D2DF] border border-[#1C4156] hover:text-white'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => setFilter('product')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${
                filter === 'product'
                  ? 'bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold shadow-md'
                  : 'bg-[#081924] text-[#A3D2DF] border border-[#1C4156] hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" strokeWidth={2} />
              Produtos
            </button>
            <button
              onClick={() => setFilter('service')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${
                filter === 'service'
                  ? 'bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold shadow-md'
                  : 'bg-[#081924] text-[#A3D2DF] border border-[#1C4156] hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" strokeWidth={2} />
              Serviços
            </button>
            <button
              onClick={() => navigate(createPageUrl('CategoryManager'))}
              className="py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#133345] text-[#A3D2DF] border border-[#1C4156] hover:text-white transition-all flex-shrink-0 whitespace-nowrap"
            >
              Categorias
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Grid / List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-[#0D222E] border border-[#1C4156] rounded-2xl overflow-hidden animate-pulse">
                  <div className="w-full h-32 bg-[#133345]" />
                  <div className="p-4 space-y-2">
                    <div className="w-3/4 h-4 bg-[#133345] rounded" />
                    <div className="w-1/2 h-5 bg-[#133345] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5' 
              : 'grid grid-cols-1 md:grid-cols-2 gap-4'
            }>
              {filteredItems.map(item => (
                <CatalogCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onClick={() => navigate(createPageUrl(`CatalogForm?id=${item.id}`))}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0D222E] border border-[#1C4156] rounded-2xl p-12 text-center"
            >
              <div className="w-16 h-16 bg-[#34A8A6]/10 border border-[#34A8A6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#4BCBB4]" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-white mb-1">Nenhum item encontrado</h3>
              <p className="text-sm text-[#A3D2DF]">Tente ajustar a busca ou adicionar novos itens ao catálogo.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
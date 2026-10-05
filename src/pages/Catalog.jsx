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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: isRefreshing ? 44 : pullDistance * 0.55 }}
        >
          <RefreshCw
            className={`w-5 h-5 text-[#2d91a8] ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ opacity: Math.min(pullDistance / 80, 1) }}
          />
        </div>
      )}
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-[#333333]">Catálogo</h1>
            <div className="flex gap-2">
              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Grid3x3 className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[#2d91a8]' : 'text-gray-400'}`} strokeWidth={2} />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[#2d91a8]' : 'text-gray-400'}`} strokeWidth={2} />
                </button>
              </div>

              <button
                onClick={handlePublishStore}
                style={{ backgroundColor: primaryColor }}
                className="h-10 px-4 rounded-full flex items-center justify-center gap-2 shadow-lg"
              >
                <Globe className="w-4 h-4 text-white" strokeWidth={2} />
                <span className="text-sm font-medium text-white">Loja Online</span>
              </button>
              <Link
                to={createPageUrl('CatalogForm')}
                style={{ backgroundColor: primaryColor }}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              >
                <Plus className="w-5 h-5 text-white" strokeWidth={2} />
              </Link>
            </div>
          </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar produtos ou serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F9F9F9] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            style={filter === 'all' ? { backgroundColor: primaryColor } : {}}
            className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              filter === 'all'
                ? 'text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('product')}
            style={filter === 'product' ? { backgroundColor: primaryColor } : {}}
            className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'product'
                ? 'text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Package className="w-4 h-4" strokeWidth={1.5} />
            Produtos
          </button>
          <button
            onClick={() => setFilter('service')}
            style={filter === 'service' ? { backgroundColor: primaryColor } : {}}
            className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'service'
                ? 'text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Wrench className="w-4 h-4" strokeWidth={1.5} />
            Serviços
          </button>
          <button
            onClick={() => navigate(createPageUrl('CategoryManager'))}
            className="py-2.5 px-4 rounded-xl text-sm font-medium bg-purple-100 text-purple-700"
          >
            Categorias
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="px-5 py-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-[20px] overflow-hidden animate-pulse">
                  <div className="w-full h-32 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="w-3/4 h-4 bg-gray-200 rounded" />
                    <div className="w-1/2 h-5 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
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
              className="bg-white rounded-[20px] p-12 text-center"
            >
              <div className="w-16 h-16 bg-[#52cfc1]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#2d91a8]/40" strokeWidth={1.5} />
              </div>
              <p className="text-gray-400">Nenhum item encontrado</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
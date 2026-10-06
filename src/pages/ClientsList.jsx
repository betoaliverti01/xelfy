import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, User, Phone, ShoppingBag, X, Edit2, Trash2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'alphabetical'
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Client.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Order.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const filteredClients = clients
    .filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      // Default: recent (by created_date, most recent first)
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const getClientOrders = (clientId) => {
    return orders.filter(o => o.client_id === clientId);
  };

  const getClientStats = (clientId) => {
    const clientOrders = getClientOrders(clientId);
    const totalSpent = clientOrders
      .filter(o => o.status === 'Concluído')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      totalOrders: clientOrders.length,
      totalSpent,
      pendingOrders: clientOrders.filter(o => !['Concluído', 'Cancelado'].includes(o.status)).length,
    };
  };

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
              <h1 className="text-lg sm:text-xl font-black text-white">Clientes Cadastrados</h1>
              <p className="text-xs text-[#A3D2DF]">{filteredClients.length} cliente(s)</p>
            </div>
            <Link
              to={createPageUrl('ClientForm')}
              className="h-9 px-3 rounded-xl bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Novo</span>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8EB3BD]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar por nome, WhatsApp ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[#081924] border border-[#1C4156] text-white placeholder-[#6E9AA6] rounded-xl text-sm focus:outline-none focus:border-[#34A8A6] transition-colors"
            />
          </div>

          {/* Sort Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                sortBy === 'recent'
                  ? 'bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold shadow-md'
                  : 'bg-[#081924] text-[#A3D2DF] border border-[#1C4156] hover:text-white'
              }`}
            >
              Mais Recentes
            </button>
            <button
              onClick={() => setSortBy('alphabetical')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                sortBy === 'alphabetical'
                  ? 'bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 font-bold shadow-md'
                  : 'bg-[#081924] text-[#A3D2DF] border border-[#1C4156] hover:text-white'
              }`}
            >
              Ordem Alfabética (A-Z)
            </button>
          </div>
        </div>
      </div>

      {/* Clients Grid - Multi-column horizontal desktop display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredClients.map(client => {
            const stats = getClientStats(client.id);
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-[#0D222E] rounded-2xl p-4 sm:p-5 shadow-sm border border-[#1C4156] hover:border-[#34A8A6]/60 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => setSelectedClient(client)}>
                    {client.photo ? (
                      <img src={client.photo} alt={client.name} className="w-12 h-12 rounded-xl object-cover border border-[#1C4156]" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#00485C] border border-[#34A8A6]/40 flex-shrink-0">
                        <User className="w-6 h-6 text-[#4BCBB4]" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base truncate group-hover:text-[#4BCBB4] transition-colors">{client.name}</h3>
                      {client.whatsapp && (
                        <p className="text-xs text-[#A3D2DF] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#34A8A6]" />
                          {client.whatsapp}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3.5 cursor-pointer" onClick={() => setSelectedClient(client)}>
                    <div className="bg-[#081924] border border-[#1C4156] rounded-xl p-2 text-center">
                      <p className="text-[10px] uppercase font-bold text-[#8EB3BD]">Pedidos</p>
                      <p className="font-black text-white text-sm mt-0.5">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-[#081924] border border-[#1C4156] rounded-xl p-2 text-center">
                      <p className="text-[10px] uppercase font-bold text-[#8EB3BD]">Total</p>
                      <p className="font-black text-[#4BCBB4] text-xs sm:text-sm mt-0.5">R$ {stats.totalSpent.toFixed(0)}</p>
                    </div>
                    <div className="bg-[#081924] border border-[#1C4156] rounded-xl p-2 text-center">
                      <p className="text-[10px] uppercase font-bold text-[#8EB3BD]">Abertos</p>
                      <p className="font-black text-amber-400 text-sm mt-0.5">{stats.pendingOrders}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-[#1C4156]/60">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(createPageUrl(`ClientForm?id=${client.id}`));
                    }}
                    className="flex-1 py-2 bg-[#133345] hover:bg-[#1a445c] text-white border border-[#1C4156] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#4BCBB4]" strokeWidth={2} />
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Deseja realmente excluir ${client.name}?`)) {
                        base44.entities.Client.delete(client.id).then(() => {
                          window.location.reload();
                        });
                      }
                    }}
                    className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
                    title="Excluir cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setSelectedClient(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-[32px] w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Histórico do Cliente</h2>
                  <button onClick={() => setSelectedClient(null)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  {selectedClient.photo ? (
                    <img src={selectedClient.photo} alt={selectedClient.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)20' }}>
                      <User className="w-8 h-8" style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-[#333333]">{selectedClient.name}</h3>
                    {selectedClient.whatsapp && <p className="text-sm text-gray-500">{selectedClient.whatsapp}</p>}
                    {selectedClient.email && <p className="text-xs text-gray-400">{selectedClient.email}</p>}
                  </div>
                </div>
              </div>

              {/* Orders History */}
              <div className="overflow-y-auto max-h-[60vh] p-5 space-y-3">
                {getClientOrders(selectedClient.id).length > 0 ? (
                  getClientOrders(selectedClient.id).map(order => (
                    <div
                      key={order.id}
                      onClick={() => {
                        setSelectedClient(null);
                        navigate(createPageUrl(`OrderForm?id=${order.id}`));
                      }}
                      className="bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Concluído' ? 'bg-green-100 text-green-700' :
                          order.status === 'Cancelado' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {order.order_date ? format(new Date(order.order_date), "dd MMM", { locale: ptBR }) : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{order.items?.length || 0} itens</p>
                        <p className="font-bold" style={{ color: 'var(--color-primary)' }}>R$ {order.total?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400">Nenhum pedido ainda</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
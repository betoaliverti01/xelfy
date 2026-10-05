import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, User, Phone, Mail, ShoppingBag, DollarSign, X, Edit2, Trash2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">Clientes</h1>
          <div className="w-10" />
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F9F9F9] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20"
          />
        </div>

        {/* Sort Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            style={sortBy === 'recent' ? { backgroundColor: 'var(--color-primary)' } : {}}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              sortBy === 'recent'
                ? 'text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Mais Recentes
          </button>
          <button
            onClick={() => setSortBy('alphabetical')}
            style={sortBy === 'alphabetical' ? { backgroundColor: 'var(--color-primary)' } : {}}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              sortBy === 'alphabetical'
                ? 'text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Clients List */}
      <div className="px-5 py-4 space-y-3">
        {filteredClients.map(client => {
          const stats = getClientStats(client.id);
          return (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[20px] p-4 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => setSelectedClient(client)}>
                {client.photo ? (
                  <img src={client.photo} alt={client.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)20' }}>
                    <User className="w-6 h-6" style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-[#333333]">{client.name}</h3>
                  {client.whatsapp && (
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {client.whatsapp}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 cursor-pointer" onClick={() => setSelectedClient(client)}>
                <div className="bg-blue-50 rounded-xl p-2 text-center">
                  <p className="text-xs text-blue-600">Pedidos</p>
                  <p className="font-bold text-blue-700">{stats.totalOrders}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2 text-center">
                  <p className="text-xs text-green-600">Total</p>
                  <p className="font-bold text-green-700 text-sm">R$ {stats.totalSpent.toFixed(0)}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2 text-center">
                  <p className="text-xs text-amber-600">Pendentes</p>
                  <p className="font-bold text-amber-700">{stats.pendingOrders}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(createPageUrl(`ClientForm?id=${client.id}`));
                  }}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={1.5} />
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
                  className="flex-1 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  Excluir
                </button>
              </div>
            </motion.div>
          );
        })}
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
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Trash2, User, Plus, Minus, Search, X, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import PaymentModal from '@/components/orders/PaymentModal';

const statusOptions = ['Orçamento', 'Pendente', 'Aprovado', 'Concluído', 'Cancelado'];
const statusColors = {
  'Orçamento': 'bg-blue-100 text-blue-700',
  'Pendente': 'bg-amber-100 text-amber-700',
  'Aprovado': 'bg-[#2d91a8]/20 text-[#2d91a8]',
  'Concluído': 'bg-green-100 text-green-700',
  'Cancelado': 'bg-red-100 text-red-700',
};

export default function OrderForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    items: [],
    status: 'Orçamento',
    order_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: '',
    subtotal: 0,
    discount: 0,
    total: 0,
    notes: '',
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Client.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: catalogItems = [] } = useQuery({
    queryKey: ['catalog', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.CatalogItem.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      base44.entities.Order.list()
        .then(orders => {
          const order = orders.find(o => o.id === orderId);
          if (order) {
            // Ensure dates are in YYYY-MM-DD format for input fields
            const orderDate = order.order_date ? order.order_date.split('T')[0] : '';
            const dueDate = order.due_date ? order.due_date.split('T')[0] : '';
            
            setFormData({
              client_id: order.client_id || '',
              client_name: order.client_name || '',
              items: order.items || [],
              status: order.status || 'Orçamento',
              order_date: orderDate,
              due_date: dueDate,
              subtotal: order.subtotal || 0,
              discount: order.discount || 0,
              total: order.total || 0,
              notes: order.notes || '',
            });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [orderId]);

  const calculateTotals = (items, discount) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const total = subtotal - (discount || 0);
    return { subtotal, total };
  };

  const handleSelectClient = (client) => {
    setFormData({ ...formData, client_id: client.id, client_name: client.name });
    setShowClientSearch(false);
    setSearchTerm('');
  };

  const handleAddItem = (catalogItem) => {
    const existingIndex = formData.items.findIndex(i => i.catalog_id === catalogItem.id);
    
    if (existingIndex >= 0) {
      const newItems = [...formData.items];
      newItems[existingIndex].quantity += 1;
      newItems[existingIndex].total = newItems[existingIndex].quantity * newItems[existingIndex].unit_price;
      const { subtotal, total } = calculateTotals(newItems, formData.discount);
      setFormData({ ...formData, items: newItems, subtotal, total });
    } else {
      const newItem = {
        catalog_id: catalogItem.id,
        name: catalogItem.name,
        quantity: 1,
        unit_price: catalogItem.sale_price,
        total: catalogItem.sale_price,
      };
      const newItems = [...formData.items, newItem];
      const { subtotal, total } = calculateTotals(newItems, formData.discount);
      setFormData({ ...formData, items: newItems, subtotal, total });
    }
    setShowItemSearch(false);
    setSearchTerm('');
  };

  const handleUpdateQuantity = (index, delta) => {
    const newItems = [...formData.items];
    newItems[index].quantity = Math.max(0, newItems[index].quantity + delta);
    
    if (newItems[index].quantity === 0) {
      newItems.splice(index, 1);
    } else {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    const { subtotal, total } = calculateTotals(newItems, formData.discount);
    setFormData({ ...formData, items: newItems, subtotal, total });
  };

  const handleDiscountChange = (value) => {
    const discount = parseFloat(value) || 0;
    const { subtotal, total } = calculateTotals(formData.items, discount);
    setFormData({ ...formData, discount, subtotal, total });
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const orderData = {
        ...formData,
        order_date: formData.order_date || format(new Date(), 'yyyy-MM-dd'),
        due_date: formData.due_date || null,
      };

      let savedOrder;
      if (orderId) {
        savedOrder = await base44.entities.Order.update(orderId, orderData);
      } else {
        savedOrder = await base44.entities.Order.create(orderData);
      }

      // Gerenciar Financial automaticamente
      if (savedOrder.status === 'Pendente' || savedOrder.status === 'Aprovado') {
        const existingFinancial = await base44.entities.Financial.filter({
          order_id: savedOrder.id,
          type: 'Receita',
          status: 'Aberto',
        });

        if (existingFinancial.length > 0) {
          await base44.entities.Financial.update(existingFinancial[0].id, {
            amount: savedOrder.total,
            due_date: savedOrder.due_date,
            description: `Pedido ${savedOrder.client_name}`,
          });
        } else {
          await base44.entities.Financial.create({
            type: 'Receita',
            amount: savedOrder.total,
            category: 'Venda',
            status: 'Aberto',
            due_date: savedOrder.due_date,
            description: `Pedido ${savedOrder.client_name}`,
            order_id: savedOrder.id,
          });
        }
      } else {
        const existingFinancial = await base44.entities.Financial.filter({
          order_id: savedOrder.id,
          type: 'Receita',
          status: 'Aberto',
        });
        if (existingFinancial.length > 0) {
          await base44.entities.Financial.delete(existingFinancial[0].id);
        }
      }

      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['financialsToReceive']);
      navigate(createPageUrl('Orders'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Deseja realmente excluir este pedido?')) {
      const existingFinancial = await base44.entities.Financial.filter({
        order_id: orderId,
        type: 'Receita',
        status: 'Aberto',
      });
      if (existingFinancial.length > 0) {
        await base44.entities.Financial.delete(existingFinancial[0].id);
      }
      await base44.entities.Order.delete(orderId);
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['financialsToReceive']);
      navigate(createPageUrl('Orders'));
    }
  };

  const handlePayment = async (paymentData) => {
    const installmentDetails = paymentData.installment_details;

    const updatedOrder = {
      ...formData,
      status: 'Aprovado',
      payment_method: paymentData.payment_method,
      installments: installmentDetails.length,
      installment_details: installmentDetails,
    };

    await base44.entities.Order.update(orderId, updatedOrder);

    const existingFinancial = await base44.entities.Financial.filter({
      order_id: orderId,
      type: 'Receita',
      status: 'Aberto',
    });
    if (existingFinancial.length > 0) {
      await base44.entities.Financial.delete(existingFinancial[0].id);
    }

    for (const installment of installmentDetails) {
      const totalInstallmentAmount = (parseFloat(installment.amount) || 0) + (parseFloat(installment.interest_amount) || 0);
      await base44.entities.Financial.create({
        type: 'Receita',
        amount: totalInstallmentAmount,
        category: 'Venda',
        status: 'Aberto',
        due_date: installment.due_date,
        description: `${formData.client_name} - Parcela ${installment.number}/${installmentDetails.length}${installment.interest_amount > 0 ? ` (c/ juros)` : ''}`,
        order_id: orderId,
      });
    }

    queryClient.invalidateQueries(['orders']);
    queryClient.invalidateQueries(['financials']);
    queryClient.invalidateQueries(['financialsToReceive']);
    setShowPaymentModal(false);
    navigate(createPageUrl('Orders'));
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCatalog = catalogItems.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">{orderId ? 'Editar Pedido' : 'Novo Pedido'}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 space-y-4">
        {/* Client Selection */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Cliente *</label>
          <button
            onClick={() => setShowClientSearch(true)}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#52cfc1]/20 flex items-center justify-center">
              <User className="w-5 h-5 text-[#2d91a8]/60" strokeWidth={1.5} />
            </div>
            <span className={formData.client_name ? 'text-[#333333] font-medium' : 'text-gray-400'}>
              {formData.client_name || 'Selecionar cliente'}
            </span>
          </button>
        </div>

        {/* Status */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setFormData({ ...formData, status })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.status === status ? statusColors[status] : 'bg-gray-100 text-gray-500'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Data do Pedido</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Vencimento</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs text-gray-400 font-medium">Itens</label>
            <button
              onClick={() => setShowItemSearch(true)}
              className="w-8 h-8 bg-[#2d91a8] rounded-full flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">{item.name}</p>
                  <p className="text-xs text-gray-400">R$ {item.unit_price?.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleUpdateQuantity(idx, -1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Minus className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(idx, 1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="w-20 text-right font-semibold text-[#2d91a8]">
                    R$ {item.total?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            {formData.items.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">Nenhum item adicionado</p>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">R$ {formData.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Desconto</span>
            <input
              type="number"
              step="0.01"
              value={formData.discount || ''}
              onChange={(e) => handleDiscountChange(e.target.value)}
              placeholder="0,00"
              className="w-24 text-right text-[#333333] font-medium bg-transparent focus:outline-none"
            />
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold text-[#333333]">Total</span>
            <span className="font-bold text-lg text-[#2d91a8]">R$ {formData.total?.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Observações</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Anotações sobre o pedido..."
            rows={3}
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={!formData.client_id || formData.items.length === 0 || isSaving}
            className="w-full py-4 bg-[#2d91a8] text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" strokeWidth={1.5} />
                Salvar Pedido
              </>
            )}
          </button>
          {orderId && formData.status !== 'Concluído' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-4 bg-green-500 text-white font-semibold rounded-[20px] flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" strokeWidth={1.5} />
              Receber
            </button>
          )}
          {orderId && (
            <button onClick={handleDelete} className="w-full py-4 bg-red-50 text-red-500 font-semibold rounded-[20px] flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              Excluir Pedido
            </button>
          )}
        </div>
      </motion.div>

      {/* Client Search Modal */}
      <AnimatePresence>
        {showClientSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowClientSearch(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-[32px] w-full max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Selecionar Cliente</h2>
                  <button onClick={() => setShowClientSearch(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-5 space-y-2">
                {filteredClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#52cfc1]/20 flex items-center justify-center">
                      <span className="font-bold text-[#2d91a8]">{client.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-[#333333]">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.whatsapp}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Search Modal */}
      <AnimatePresence>
        {showItemSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowItemSearch(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-[32px] w-full max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Adicionar Item</h2>
                  <button onClick={() => setShowItemSearch(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produto ou serviço..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-5 space-y-2">
                {filteredCatalog.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.photo ? (
                        <img src={item.photo} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#52cfc1]/20 flex items-center justify-center">
                          <span className="text-[#2d91a8] text-sm font-bold">{item.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-medium text-[#333333]">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.type}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#2d91a8]">R$ {item.sale_price?.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        order={formData}
        onConfirm={handlePayment}
      />
    </div>
  );
}
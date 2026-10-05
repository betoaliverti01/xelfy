import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Send, Package, Info, Grid, List, Tag } from 'lucide-react';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

export default function Storefront() {
  const urlParams = new URLSearchParams(window.location.search);
  const storeUrlParam = urlParams.get('store');
  const isDesktop = useIsDesktop();

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [storeOwner, setStoreOwner] = useState(null);
  const [activeView, setActiveView] = useState('products');
  const [viewMode, setViewMode] = useState('grid');
  const [customerName, setCustomerName] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderType, setOrderType] = useState('');

  const { data: stores = [], isLoading: loadingStore } = useQuery({
    queryKey: ['publicStore', storeUrlParam],
    queryFn: async () => {
      try {
        const allStores = await base44.entities.OnlineStore.list();
        return allStores.filter(s => s.store_url === storeUrlParam && s.is_published);
      } catch { return []; }
    },
    enabled: !!storeUrlParam,
  });

  const store = stores[0];

  useEffect(() => {
    if (store?.created_by) setStoreOwner(store.created_by);
  }, [store]);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['storeProducts', storeOwner],
    queryFn: async () => {
      if (!storeOwner) return [];
      try {
        const items = await base44.entities.CatalogItem.list();
        return items.filter(item => item.created_by === storeOwner && item.type === 'Produto');
      } catch { return []; }
    },
    enabled: !!storeOwner,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['storeServices', storeOwner],
    queryFn: async () => {
      if (!storeOwner) return [];
      try {
        const items = await base44.entities.CatalogItem.list();
        return items.filter(item => item.created_by === storeOwner && item.type === 'Serviço');
      } catch { return []; }
    },
    enabled: !!storeOwner,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['storeCategories', storeOwner],
    queryFn: async () => {
      if (!storeOwner) return [];
      try {
        const cats = await base44.entities.Category.list();
        return cats.filter(c => c.created_by === storeOwner).sort((a, b) => (a.order || 0) - (b.order || 0));
      } catch { return []; }
    },
    enabled: !!storeOwner,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['storeSettings', storeOwner],
    queryFn: async () => {
      if (!storeOwner) return [];
      try {
        const allSettings = await base44.entities.AppSettings.list();
        return allSettings.filter(s => s.created_by === storeOwner);
      } catch { return []; }
    },
    enabled: !!storeOwner,
  });

  const storeSetting = settings[0] || {};

  const filteredProducts = (selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory))
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const filteredServices = (selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory))
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const addToCart = (product) => {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const sendToWhatsApp = () => {
    if (cart.length === 0 || !customerName.trim()) return;
    const documentNumber = Math.random().toString(36).substring(2, 10).toUpperCase();
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    let message = `*PEDIDO - LOJA ONLINE*\n\n`;
    message += `*Documento N:* ${documentNumber}\n*Data:* ${dateStr}\n*Cliente:* ${customerName}\n`;
    if (paymentMethod) message += `*Forma de Pagamento:* ${paymentMethod}\n`;
    if (orderType) message += `*Tipo de Pedido:* ${orderType}\n`;
    message += `\n*ITENS DO PEDIDO*\n\n`;
    cart.forEach(item => {
      message += `${item.name}\n   ${item.quantity}x R$ ${item.sale_price.toFixed(2)} = *R$ ${(item.sale_price * item.quantity).toFixed(2)}*\n\n`;
    });
    message += `*TOTAL: R$ ${cartTotal.toFixed(2)}*`;
    if (orderNotes.trim()) message += `\n\n*Observações:*\n${orderNotes}`;
    const phone = store?.whatsapp_number?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    setShowCheckout(false);
    setCustomerName('');
    setOrderNotes('');
    setPaymentMethod('');
    setOrderType('');
  };

  if (loadingStore || loadingProducts) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2d91a8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Loja indisponível</h1>
          <p className="text-gray-500">Esta loja não existe ou está indisponível.</p>
        </div>
      </div>
    );
  }

  // ─── Shared sub-components ────────────────────────────────────────────────

  const ProductCard = ({ item, wide = false }) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 relative cursor-pointer hover:shadow-md transition-shadow ${wide ? 'flex' : ''}`}
      onClick={() => setSelectedProduct(item)}
    >
      {item.featured && (
        <div className={`absolute ${wide ? 'top-2 left-2' : 'top-2 left-2'} bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10`}>
          ⭐ Destaque
        </div>
      )}
      <div className={`${wide ? 'w-32 h-32 flex-shrink-0' : 'h-36'} bg-[#52cfc1]/20 flex items-center justify-center`}>
        {item.photo
          ? <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
          : <Package className="w-12 h-12 text-[#2d91a8]/40" strokeWidth={1} />}
      </div>
      <div className={`p-3 bg-white ${wide ? 'flex-1 flex flex-col justify-between' : ''}`}>
        <div>
          <h3 className="font-semibold text-sm text-[#333333] mb-1 line-clamp-2">{item.name}</h3>
          {wide && item.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-[#2d91a8]">R$ {item.sale_price.toFixed(2)}</p>
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
            className="w-8 h-8 bg-[#2d91a8] rounded-full flex items-center justify-center hover:bg-[#2578a0] transition-colors"
          >
            <Plus className="w-4 h-4 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const CheckoutForm = ({ onClose }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-600 mb-2 block">Seu nome *</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Digite seu nome"
          className="w-full px-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20"
          autoFocus
        />
      </div>
      {store?.enable_notes && (
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Observações</label>
          <textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Alguma observação sobre o pedido?"
            rows={3}
            className="w-full px-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20 resize-none"
          />
        </div>
      )}
      {store?.enable_payment_method && (
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Forma de Pagamento</label>
          <div className="space-y-2">
            {['PIX', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito'].map(method => (
              <label key={method} className="flex items-center gap-3 p-3 bg-gray-100 rounded-2xl cursor-pointer hover:bg-gray-200 transition-colors">
                <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#2d91a8]" />
                <span className="text-sm text-[#333333]">{method}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {store?.enable_order_type && (
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Tipo de Pedido</label>
          <div className="space-y-2">
            {[{ value: 'Retirar no Local', label: 'Retirar no Local', note: '' }, { value: 'Delivery', label: 'Delivery', note: '(taxa a combinar)' }].map(type => (
              <label key={type.value} className="flex items-center gap-3 p-3 bg-gray-100 rounded-2xl cursor-pointer hover:bg-gray-200 transition-colors">
                <input type="radio" name="orderType" value={type.value} checked={orderType === type.value} onChange={(e) => setOrderType(e.target.value)} className="w-4 h-4 text-[#2d91a8]" />
                <span className="text-sm text-[#333333]">{type.label} {type.note && <span className="text-xs text-gray-500">{type.note}</span>}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2 pt-2">
        <button onClick={sendToWhatsApp} disabled={!customerName.trim()} className="w-full py-3 bg-green-500 rounded-2xl font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
          <Send className="w-4 h-4" /> Enviar Pedido
        </button>
        <button onClick={onClose} className="w-full py-3 bg-gray-100 rounded-2xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );

  const AboutSection = () => (
    <div className="space-y-4">
      {storeSetting.company_name && <div><h3 className="font-semibold text-[#333333] mb-1">Empresa</h3><p className="text-gray-600 text-sm">{storeSetting.company_name}</p></div>}
      {storeSetting.company_address && <div><h3 className="font-semibold text-[#333333] mb-1">Endereço</h3><p className="text-gray-600 text-sm">{storeSetting.company_address}</p></div>}
      {storeSetting.company_phone && <div><h3 className="font-semibold text-[#333333] mb-1">Telefone</h3><a href={`tel:${storeSetting.company_phone}`} className="text-[#2d91a8] text-sm">{storeSetting.company_phone}</a></div>}
      {storeSetting.company_email && <div><h3 className="font-semibold text-[#333333] mb-1">Email</h3><a href={`mailto:${storeSetting.company_email}`} className="text-[#2d91a8] text-sm">{storeSetting.company_email}</a></div>}
      {(storeSetting.company_instagram || storeSetting.company_facebook) && (
        <div>
          <h3 className="font-semibold text-[#333333] mb-2">Redes Sociais</h3>
          <div className="flex gap-2 flex-wrap">
            {storeSetting.company_instagram && <a href={storeSetting.company_instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm">Instagram</a>}
            {storeSetting.company_facebook && <a href={storeSetting.company_facebook} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm">Facebook</a>}
          </div>
        </div>
      )}
    </div>
  );

  // ─── DESKTOP LAYOUT ───────────────────────────────────────────────────────
  if (isDesktop) {
    const currentItems = activeView === 'products' ? filteredProducts : filteredServices;
    const desktopCols = viewMode === 'grid' ? 'grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1';

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Header */}
        <div className="relative h-64 bg-gradient-to-br from-[#52cfc1] to-[#2d91a8]">
          {store.banner_image && <img src={store.banner_image} alt="Banner" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-6 left-8 flex items-end gap-5">
            {storeSetting.company_logo && (
              <img src={storeSetting.company_logo} alt="Logo" className="w-20 h-20 rounded-full bg-white shadow-xl object-cover border-4 border-white flex-shrink-0" />
            )}
            <div className="text-white pb-1">
              <h1 className="text-3xl font-bold">{storeSetting.company_name || 'Loja'}</h1>
              {storeSetting.company_phone && <p className="text-white/80 text-sm mt-1">{storeSetting.company_phone}</p>}
            </div>
          </div>
        </div>

        {/* Nav bar */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-40">
          <div className="max-w-screen-2xl mx-auto px-8 flex items-center justify-between h-14">
            <div className="flex gap-1">
              {products.length > 0 && (
                <button onClick={() => setActiveView('products')} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeView === 'products' ? 'bg-[#2d91a8] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  Produtos
                </button>
              )}
              {services.length > 0 && (
                <button onClick={() => setActiveView('services')} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeView === 'services' ? 'bg-[#2d91a8] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  Serviços
                </button>
              )}
              <button onClick={() => setActiveView('about')} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeView === 'about' ? 'bg-[#2d91a8] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                Sobre
              </button>
            </div>
            {activeView !== 'about' && (
              <div className="flex gap-2 bg-gray-100 rounded-full p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#2d91a8]' : 'text-gray-400'}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#2d91a8]' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>

        {/* 3-column layout */}
        <div className="max-w-screen-2xl mx-auto px-8 py-8 flex gap-8">

          {/* LEFT: Categories sidebar */}
          {activeView !== 'about' && (
            <aside className="w-56 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-20">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Categorias
                </h2>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-[#2d91a8] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Todos
                  </button>
                  {categories
                    .filter(cat => (activeView === 'products' ? products : services).some(p => p.category === cat.name))
                    .map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.name ? 'bg-[#2d91a8] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                </div>
              </div>
            </aside>
          )}

          {/* CENTER: Products */}
          <main className="flex-1 min-w-0">
            {activeView === 'about' ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl">
                <h2 className="text-2xl font-bold text-[#333333] mb-6">Sobre Nós</h2>
                <AboutSection />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{currentItems.length} item(s) encontrado(s)</p>
                {currentItems.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum item nesta categoria.</p>
                  </div>
                ) : (
                  <div className={`grid ${desktopCols} gap-4`}>
                    {currentItems.map(item => (
                      <ProductCard key={item.id} item={item} wide={viewMode === 'list'} />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>

          {/* RIGHT: Cart sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm sticky top-20 overflow-hidden">
              <div className="px-5 py-4 text-white" style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Carrinho</h2>
                  <span className="text-white/80 text-sm">{cartItemsCount} item(s)</span>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Carrinho vazio</p>
                  </div>
                ) : cart.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-3 flex gap-3">
                    {item.photo
                      ? <img src={item.photo} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      : <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-gray-400" /></div>}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-[#333333] line-clamp-1">{item.name}</h4>
                      <p className="text-[#2d91a8] font-bold text-sm">R$ {item.sale_price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"><Minus className="w-3 h-3" /></button>
                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total:</span>
                    <span className="text-xl font-bold text-[#2d91a8]">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={() => setShowCheckout(true)} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Send className="w-4 h-4" /> Finalizar Pedido
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Desktop Checkout Modal */}
        <AnimatePresence>
          {showCheckout && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowCheckout(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#333333]">Finalizar Pedido</h2>
                  <button onClick={() => setShowCheckout(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4 text-gray-600" /></button>
                </div>
                <CheckoutForm onClose={() => setShowCheckout(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Detail Modal (desktop) */}
        <AnimatePresence>
          {selectedProduct && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setSelectedProduct(null)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative w-full h-72 bg-[#52cfc1]/20 flex items-center justify-center rounded-t-2xl overflow-hidden flex-shrink-0">
                    {selectedProduct.photo ? <img src={selectedProduct.photo} alt={selectedProduct.name} className="w-full h-full object-cover" /> : <Package className="w-20 h-20 text-[#2d91a8]/40" strokeWidth={1} />}
                    <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow"><X className="w-4 h-4 text-gray-600" /></button>
                  </div>
                  <div className="p-8">
                    {selectedProduct.featured && <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-3">⭐ Destaque</div>}
                    <h2 className="text-2xl font-bold text-[#333333] mb-2">{selectedProduct.name}</h2>
                    {selectedProduct.description && <p className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{selectedProduct.description}</p>}
                    {selectedProduct.code && <p className="text-xs text-gray-400 mb-4">SKU: {selectedProduct.code}</p>}
                    <div className="bg-[#2d91a8]/10 rounded-xl p-4 mb-6">
                      <p className="text-3xl font-bold text-[#2d91a8]">R$ {selectedProduct.sale_price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex-1 py-3 bg-[#2d91a8] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#2578a0] transition-colors">
                        <Plus className="w-5 h-5" /> Adicionar ao Carrinho
                      </button>
                      <button onClick={() => setSelectedProduct(null)} className="px-5 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors">Fechar</button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── MOBILE LAYOUT (original) ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Banner Header */}
      <div className="relative h-56 bg-gradient-to-br from-[#52cfc1] to-[#2d91a8]">
        {store.banner_image && <img src={store.banner_image} alt="Banner" className="w-full h-full object-cover" />}
        {storeSetting.company_logo && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <img src={storeSetting.company_logo} alt="Logo" className="w-24 h-24 rounded-full bg-white shadow-lg object-cover border-4 border-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 mt-16">
        {activeView !== 'about' && (
          <div className="flex justify-end mb-4">
            <div className="flex gap-2 bg-gray-100 rounded-full p-1">
              <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#2d91a8]' : 'text-gray-500'}`}>Grade</button>
              <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#2d91a8]' : 'text-gray-500'}`}>Lista</button>
            </div>
          </div>
        )}

        {activeView === 'products' && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3 mb-6' : 'space-y-3 mb-6'}>
            {filteredProducts.map(product => (
              viewMode === 'grid' ? (
                <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 relative cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProduct(product)}>
                  {product.featured && <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">⭐ Destaque</div>}
                  <div className="h-32 bg-[#52cfc1]/20 flex items-center justify-center">
                    {product.photo ? <img src={product.photo} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-12 h-12 text-[#2d91a8]/40" strokeWidth={1} />}
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="font-semibold text-sm text-[#333333] mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-[#2d91a8]">R$ {product.sale_price.toFixed(2)}</p>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="w-8 h-8 bg-[#2d91a8] rounded-full flex items-center justify-center"><Plus className="w-4 h-4 text-white" strokeWidth={2} /></button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[20px] p-4 flex items-center gap-3 shadow-sm border border-gray-100 relative cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProduct(product)}>
                  {product.featured && <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10">⭐ Destaque</div>}
                  <div className="w-16 h-16 rounded-xl bg-[#52cfc1]/20 flex items-center justify-center flex-shrink-0">
                    {product.photo ? <img src={product.photo} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : <Package className="w-8 h-8 text-[#2d91a8]/40" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-[#333333]">{product.name}</h3>
                    {product.description && <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>}
                    <p className="text-lg font-bold text-[#2d91a8] mt-1">R$ {product.sale_price.toFixed(2)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="w-10 h-10 bg-[#2d91a8] rounded-full flex items-center justify-center flex-shrink-0"><Plus className="w-5 h-5 text-white" strokeWidth={2} /></button>
                </motion.div>
              )
            ))}
          </div>
        )}

        {activeView === 'services' && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3 mb-6' : 'space-y-3 mb-6'}>
            {filteredServices.map(service => (
              viewMode === 'grid' ? (
                <motion.div key={service.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProduct(service)}>
                  <div className="h-32 bg-[#52cfc1]/20 flex items-center justify-center">
                    {service.photo ? <img src={service.photo} alt={service.name} className="w-full h-full object-cover" /> : <Package className="w-12 h-12 text-[#2d91a8]/40" strokeWidth={1} />}
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="font-semibold text-sm text-[#333333] mb-1 line-clamp-1">{service.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-[#2d91a8]">R$ {service.sale_price.toFixed(2)}</p>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(service); }} className="w-8 h-8 bg-[#2d91a8] rounded-full flex items-center justify-center"><Plus className="w-4 h-4 text-white" strokeWidth={2} /></button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={service.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[20px] p-4 flex items-center gap-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProduct(service)}>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#52cfc1]/20 to-[#2d91a8]/20 flex items-center justify-center flex-shrink-0">
                    {service.photo ? <img src={service.photo} alt={service.name} className="w-full h-full object-cover rounded-xl" /> : <Package className="w-8 h-8 text-[#2d91a8]/40" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-[#333333]">{service.name}</h3>
                    {service.description && <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>}
                    <p className="text-lg font-bold text-[#2d91a8] mt-1">R$ {service.sale_price.toFixed(2)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(service); }} className="w-10 h-10 bg-[#2d91a8] rounded-full flex items-center justify-center flex-shrink-0"><Plus className="w-5 h-5 text-white" strokeWidth={2} /></button>
                </motion.div>
              )
            ))}
          </div>
        )}

        {activeView === 'about' && (
          <div className="bg-white rounded-[20px] p-5 space-y-4 relative">
            <button onClick={() => setActiveView('products')} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4 text-gray-600" /></button>
            <h2 className="text-xl font-bold text-[#333333] mb-4">Sobre Nós</h2>
            <AboutSection />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] shadow-2xl" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="flex items-center justify-around py-4 relative">
          <button onClick={() => setShowCategoryModal(true)} className="flex-1 flex flex-col items-center gap-1 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Package className="w-6 h-6" /></div>
            <span className="text-xs">Categorias</span>
          </button>
          <button onClick={() => setShowCart(true)} className="flex-1 flex flex-col items-center gap-1 relative -mt-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl relative" style={{ backgroundColor: 'var(--color-primary)' }}>
              <ShoppingCart className="w-10 h-10 text-white" strokeWidth={2} />
              {cartItemsCount > 0 && <span className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">{cartItemsCount > 9 ? '9+' : cartItemsCount}</span>}
            </div>
          </button>
          <button onClick={() => setActiveView('about')} className="flex-1 flex flex-col items-center gap-1 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Info className="w-6 h-6" /></div>
            <span className="text-xs">Sobre Nós</span>
          </button>
        </div>
      </div>

      {/* Mobile Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCategoryModal(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md z-50 p-5 overflow-y-auto bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#333333]">Categorias</h2>
                <button onClick={() => setShowCategoryModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-5 h-5 text-gray-600" /></button>
              </div>
              {products.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#333333] mb-3">Produtos</h3>
                  <div className="space-y-2">
                    <button onClick={() => { setSelectedCategory('all'); setActiveView('products'); setShowCategoryModal(false); }} className={`w-full py-3 rounded-2xl font-medium text-left px-4 transition-all ${activeView === 'products' && selectedCategory === 'all' ? 'bg-[#2d91a8] text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}>Todos</button>
                    {categories.filter(cat => products.some(p => p.category === cat.name)).map(cat => (
                      <button key={cat.id} onClick={() => { setSelectedCategory(cat.name); setActiveView('products'); setShowCategoryModal(false); }} className={`w-full py-3 rounded-2xl font-medium text-left px-4 transition-all ${activeView === 'products' && selectedCategory === cat.name ? 'bg-[#2d91a8] text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}>{cat.name}</button>
                    ))}
                  </div>
                </div>
              )}
              {services.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-[#333333] mb-3">Serviços</h3>
                  <div className="space-y-2">
                    <button onClick={() => { setSelectedCategory('all'); setActiveView('services'); setShowCategoryModal(false); }} className={`w-full py-3 rounded-2xl font-medium text-left px-4 transition-all ${activeView === 'services' && selectedCategory === 'all' ? 'bg-[#2d91a8] text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}>Todos</button>
                    {categories.filter(cat => services.some(s => s.category === cat.name)).map(cat => (
                      <button key={cat.id} onClick={() => { setSelectedCategory(cat.name); setActiveView('services'); setShowCategoryModal(false); }} className={`w-full py-3 rounded-2xl font-medium text-left px-4 transition-all ${activeView === 'services' && selectedCategory === cat.name ? 'bg-[#2d91a8] text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}>{cat.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowCart(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
              <div className="px-5 py-6 text-white" style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))' }}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">Carrinho</h2>
                  <button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-white/70 text-sm">{cartItemsCount > 0 ? `${cartItemsCount} item(s)` : 'Carrinho vazio.'}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length > 0 ? cart.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-2xl p-3 flex gap-3">
                    {item.photo ? <img src={item.photo} alt={item.name} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center"><Package className="w-6 h-6 text-gray-400" /></div>}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-[#333333]">{item.name}</h4>
                      <p className="text-[#2d91a8] font-bold text-sm">R$ {item.sale_price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mb-3" />
                    <p className="text-gray-400">Seu carrinho está vazio.</p>
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#333333]">Total:</span>
                    <span className="text-2xl font-bold text-[#2d91a8]">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={() => setShowCheckout(true)} className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-[20px] flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" /> Finalizar Pedido
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowCheckout(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl z-50 p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-[#333333] mb-4">Finalizar Pedido</h2>
              <CheckoutForm onClose={() => setShowCheckout(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setSelectedProduct(null)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl z-50 p-5" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-5 h-5 text-gray-600" /></button>
              <div className="w-full h-64 rounded-[20px] bg-[#52cfc1]/20 flex items-center justify-center mb-6 overflow-hidden">
                {selectedProduct.photo ? <img src={selectedProduct.photo} alt={selectedProduct.name} className="w-full h-full object-cover" /> : <Package className="w-20 h-20 text-[#2d91a8]/40" strokeWidth={1} />}
              </div>
              <div className="mb-6">
                {selectedProduct.featured && <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-3">⭐ Destaque</div>}
                <h2 className="text-2xl font-bold text-[#333333] mb-3">{selectedProduct.name}</h2>
                {selectedProduct.description && <div className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap break-words">{selectedProduct.description}</div>}
                {selectedProduct.code && <p className="text-xs text-gray-400 mb-4">SKU: {selectedProduct.code}</p>}
                <div className="bg-[#2d91a8]/10 rounded-[16px] p-4 mb-6"><p className="text-3xl font-bold text-[#2d91a8]">R$ {selectedProduct.sale_price.toFixed(2)}</p></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex-1 py-4 bg-[#2d91a8] text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 hover:bg-[#2d91a8]/90 transition-colors">
                  <Plus className="w-5 h-5" /> Adicionar ao Carrinho
                </button>
                <button onClick={() => setSelectedProduct(null)} className="px-6 py-4 bg-gray-100 text-gray-600 font-semibold rounded-[20px] hover:bg-gray-200 transition-colors">Fechar</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
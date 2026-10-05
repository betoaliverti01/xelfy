import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Package, DollarSign, Layers, Camera, ToggleLeft, ToggleRight, Plus, Minus, X, Search, ChevronDown, Tag } from 'lucide-react';

export default function CatalogForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'Produto',
    category: '',
    sale_price: '',
    cost_price: '',
    stock: '',
    control_stock: true,
    photo: '',
    featured: false,
    recipe: [],
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['inventory', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Inventory.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Category.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (itemId) {
      setIsLoading(true);
      base44.entities.CatalogItem.list()
        .then(items => {
          const item = items.find(i => i.id === itemId);
          if (item) {
            setFormData({
              code: item.code || '',
              name: item.name || '',
              description: item.description || '',
              type: item.type || 'Produto',
              category: item.category || '',
              sale_price: item.sale_price?.toString() || '',
              cost_price: item.cost_price?.toString() || '',
              stock: item.stock?.toString() || '',
              control_stock: item.control_stock ?? true,
              photo: item.photo || '',
              featured: item.featured || false,
              recipe: [],
            });
            
            // Load recipe if exists
            base44.entities.ProductRecipe.filter({ catalog_item_id: itemId })
              .then(recipes => {
                if (recipes[0]) {
                  setFormData(prev => ({ ...prev, recipe: recipes[0].recipe || [] }));
                  const totalCost = (recipes[0].recipe || []).reduce((sum, r) => sum + r.cost, 0);
                  setFormData(prev => ({ ...prev, cost_price: totalCost.toString() }));
                }
              });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [itemId]);

  const handleAddInventoryItem = (stockItem) => {
    const newRecipe = [...formData.recipe];
    const existingIndex = newRecipe.findIndex(r => r.inventory_id === stockItem.id);
    
    if (existingIndex >= 0) {
      newRecipe[existingIndex].quantity_needed += 1;
      newRecipe[existingIndex].cost = newRecipe[existingIndex].quantity_needed * stockItem.unit_cost;
    } else {
      newRecipe.push({
        inventory_id: stockItem.id,
        inventory_name: stockItem.name,
        quantity_needed: 1,
        unit: stockItem.unit,
        cost: stockItem.unit_cost,
      });
    }
    
    const totalCost = newRecipe.reduce((sum, item) => sum + item.cost, 0);
    setFormData({ ...formData, recipe: newRecipe, cost_price: totalCost.toString() });
    setShowInventoryModal(false);
  };

  const handleUpdateRecipeQuantity = (index, delta) => {
    const newRecipe = [...formData.recipe];
    newRecipe[index].quantity_needed = Math.max(0, newRecipe[index].quantity_needed + delta);
    
    if (newRecipe[index].quantity_needed === 0) {
      newRecipe.splice(index, 1);
    } else {
      const stockItem = stock.find(i => i.id === newRecipe[index].inventory_id);
      if (stockItem) {
        newRecipe[index].cost = newRecipe[index].quantity_needed * stockItem.unit_cost;
      }
    }
    
    const totalCost = newRecipe.reduce((sum, item) => sum + item.cost, 0);
    setFormData({ ...formData, recipe: newRecipe, cost_price: totalCost.toString() });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        sale_price: parseFloat(formData.sale_price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        stock: parseInt(formData.stock) || 0,
        control_stock: formData.control_stock,
        photo: formData.photo,
        featured: formData.featured,
      };
      
      let savedItemId = itemId;
      if (itemId) {
        await base44.entities.CatalogItem.update(itemId, data);
      } else {
        const newItem = await base44.entities.CatalogItem.create(data);
        savedItemId = newItem.id;
      }

      // Save recipe if exists
      if (formData.recipe?.length > 0) {
        const existingRecipes = await base44.entities.ProductRecipe.filter({ catalog_item_id: savedItemId });
        const recipeData = {
          catalog_item_id: savedItemId,
          catalog_item_name: formData.name,
          recipe: formData.recipe,
          total_cost: parseFloat(formData.cost_price) || 0,
        };
        
        if (existingRecipes[0]) {
          await base44.entities.ProductRecipe.update(existingRecipes[0].id, recipeData);
        } else {
          await base44.entities.ProductRecipe.create(recipeData);
        }
      }
      
      queryClient.invalidateQueries(['catalog']);
      navigate(createPageUrl('Catalog'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Deseja realmente excluir este item?')) {
      await base44.entities.CatalogItem.delete(itemId);
      
      const recipes = await base44.entities.ProductRecipe.filter({ catalog_item_id: itemId });
      if (recipes[0]) {
        await base44.entities.ProductRecipe.delete(recipes[0].id);
      }
      
      queryClient.invalidateQueries(['catalog']);
      navigate(createPageUrl('Catalog'));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, photo: file_url });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4A5D23] border-t-transparent rounded-full animate-spin" />
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
          <h1 className="text-lg font-bold text-[#333333]">
            {itemId ? 'Editar Item' : 'Novo Item'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 pb-36 space-y-4">
        {/* Code */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Código/SKU</label>
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="ABC123"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <label className="block cursor-pointer">
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            {formData.photo ? (
              <img src={formData.photo} alt="Foto" className="w-full h-40 object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-40 bg-[#52cfc1]/10 rounded-2xl flex flex-col items-center justify-center">
                <Camera className="w-10 h-10 text-[#2d91a8]/40 mb-2" strokeWidth={1.5} />
                <span className="text-sm text-gray-400">Adicionar foto</span>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </label>

        {/* Type Selector */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Tipo *</label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({ ...formData, type: 'Produto' })}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                formData.type === 'Produto' ? 'bg-[#2d91a8] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Produto
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: 'Serviço', control_stock: false })}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                formData.type === 'Serviço' ? 'bg-[#2d91a8] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Serviço
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Nome *</label>
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do produto ou serviço"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição detalhada..."
            rows={3}
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none resize-none"
          />
        </div>

        {/* Category */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Categoria</label>
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className={formData.category ? 'text-[#333333]' : 'text-gray-400'}>
              {formData.category || 'Selecione uma categoria'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Featured Toggle */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-[#333333] font-medium">Produto em Destaque</label>
              <p className="text-xs text-gray-400">Aparecer na seção de destaques da loja</p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, featured: !formData.featured })}
              className="text-[#2d91a8]"
            >
              {formData.featured ? (
                <ToggleRight className="w-10 h-10" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Recipe / Ingredients */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-gray-400 font-medium">Componentes do Estoque</label>
            <button onClick={() => setShowInventoryModal(true)} className="w-8 h-8 bg-[#2d91a8] rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
          </div>
          
          {formData.recipe?.length > 0 ? (
            <div className="space-y-2">
              {formData.recipe.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-[#333333]">{item.inventory_name}</p>
                    <p className="text-xs text-gray-400">R$ {item.cost?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleUpdateRecipeQuantity(idx, -1)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <Minus className="w-3 h-3 text-gray-500" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity_needed}</span>
                    <button onClick={() => handleUpdateRecipeQuantity(idx, 1)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <Plus className="w-3 h-3 text-gray-500" />
                    </button>
                    <span className="text-xs text-gray-400">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-xs py-3">Nenhum componente</p>
          )}
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Preço de Venda *</label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
              <input
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                placeholder="0,00"
                className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Custo (Calculado)</label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                disabled
                className="flex-1 text-[#333333] text-sm bg-gray-50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Stock Controls */}
        {formData.type === 'Produto' && (
          <>
            <div className="bg-white rounded-[20px] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-[#333333] font-medium">Controlar Estoque</label>
                  <p className="text-xs text-gray-400">Ativar controle</p>
                </div>
                <button onClick={() => setFormData({ ...formData, control_stock: !formData.control_stock })} className="text-[#2d91a8]">
                  {formData.control_stock ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
                </button>
              </div>
            </div>

            {formData.control_stock && (
              <div className="bg-white rounded-[20px] p-4 shadow-sm">
                <label className="text-xs text-gray-400 font-medium mb-2 block">Estoque</label>
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={!formData.name || !formData.sale_price || isSaving}
            style={{ backgroundColor: user?.primary_color || '#2d91a8' }}
            className="w-full py-4 text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Item
              </>
            )}
          </button>

          {itemId && (
            <button onClick={handleDelete} className="w-full py-4 bg-red-50 text-red-500 font-semibold rounded-[20px] flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              Excluir Item
            </button>
          )}
        </div>
      </motion.div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowCategoryModal(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl z-50 max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Selecionar Categoria</h2>
                  <button onClick={() => setShowCategoryModal(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-5 space-y-2">
                <button
                  onClick={() => {
                    setFormData({ ...formData, category: '' });
                    setShowCategoryModal(false);
                  }}
                  className="w-full p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left text-gray-500"
                >
                  Nenhuma categoria
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFormData({ ...formData, category: cat.name });
                      setShowCategoryModal(false);
                    }}
                    className="w-full p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left font-medium text-[#333333]"
                  >
                    {cat.name}
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">
                    Nenhuma categoria criada.{' '}
                    <button
                      onClick={() => navigate(createPageUrl('CategoryManager'))}
                      className="text-[#2d91a8] font-medium"
                    >
                      Criar categoria
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Inventory Modal */}
      <AnimatePresence>
        {showInventoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowInventoryModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-[32px] w-full max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Adicionar Componente</h2>
                  <button onClick={() => setShowInventoryModal(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-5 space-y-2">
                {stock.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddInventoryItem(item)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#52cfc1]/20 flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#2d91a8]" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[#333333]">{item.name}</p>
                        <p className="text-xs text-gray-400">Estoque: {item.quantity} {item.unit}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#2d91a8] text-sm">R$ {item.unit_cost?.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
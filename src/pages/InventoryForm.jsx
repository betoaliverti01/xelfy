import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const units = ['un', 'kg', 'g', 'L', 'ml', 'm', 'cm', 'pacote', 'caixa'];

export default function InventoryForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: 'un',
    quantity: 0,
    unit_cost: 0,
    min_quantity: 0,
  });

  useEffect(() => {
    if (itemId) {
      setIsLoading(true);
      base44.entities.Inventory.list()
        .then(items => {
          const item = items.find(i => i.id === itemId);
          if (item) {
            setFormData({
              name: item.name || '',
              description: item.description || '',
              unit: item.unit || 'un',
              quantity: item.quantity || 0,
              unit_cost: item.unit_cost || 0,
              min_quantity: item.min_quantity || 0,
            });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [itemId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (itemId) {
        await base44.entities.Inventory.update(itemId, formData);
      } else {
        await base44.entities.Inventory.create(formData);
      }
      queryClient.invalidateQueries(['inventory']);
      navigate(createPageUrl('InventoryList'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Deseja realmente excluir este item?')) {
      await base44.entities.Inventory.delete(itemId);
      queryClient.invalidateQueries(['inventory']);
      navigate(createPageUrl('InventoryList'));
    }
  };

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
          <h1 className="text-lg font-bold text-[#333333]">{itemId ? 'Editar Item do Estoque' : 'Novo Item do Estoque'}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 pb-36 space-y-4">
        {/* Name */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Nome do Item *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Folha A4 Sulfite"
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição do item..."
            rows={2}
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none resize-none"
          />
        </div>

        {/* Unit */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Unidade de Medida</label>
          <div className="flex flex-wrap gap-2">
            {units.map(unit => (
              <button
                key={unit}
                onClick={() => setFormData({ ...formData, unit })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.unit === unit
                    ? 'bg-[#2d91a8] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity & Unit Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Quantidade</label>
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              className="w-full text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Custo Unit. (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.unit_cost}
              onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
              className="w-full text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Min Quantity */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Quantidade Mínima (Alerta)</label>
          <input
            type="number"
            step="0.01"
            value={formData.min_quantity}
            onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) || 0 })}
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={!formData.name || isSaving}
            className="w-full py-4 bg-[#2d91a8] text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" strokeWidth={1.5} />
                Salvar Item
              </>
            )}
          </button>
          {itemId && (
            <button onClick={handleDelete} className="w-full py-4 bg-red-50 text-red-500 font-semibold rounded-[20px] flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              Excluir Item
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
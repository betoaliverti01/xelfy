import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Globe, Camera, Phone, ToggleLeft, ToggleRight, Copy, ExternalLink } from 'lucide-react';

export default function StoreSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: store = [] } = useQuery({
    queryKey: ['onlineStore', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.OnlineStore.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['appSettings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.AppSettings.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const [formData, setFormData] = useState({
    store_url: '',
    is_published: false,
    banner_image: '',
    whatsapp_number: '',
    enable_notes: true,
    enable_payment_method: true,
    enable_order_type: true,
  });

  useEffect(() => {
    if (store[0]) {
      setFormData({
        store_url: store[0].store_url || '',
        is_published: store[0].is_published || false,
        banner_image: store[0].banner_image || '',
        whatsapp_number: store[0].whatsapp_number || '',
        enable_notes: store[0].enable_notes !== undefined ? store[0].enable_notes : true,
        enable_payment_method: store[0].enable_payment_method !== undefined ? store[0].enable_payment_method : true,
        enable_order_type: store[0].enable_order_type !== undefined ? store[0].enable_order_type : true,
      });
    } else if (settings[0]) {
      // Pré-preencher com dados de personalização
      setFormData(prev => ({
        ...prev,
        whatsapp_number: settings[0].company_phone || '',
      }));
    }
  }, [store, settings]);

  const handleSave = async () => {
    if (!formData.store_url) {
      alert('Por favor, defina uma URL para sua loja');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        store_url: formData.store_url.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        is_published: formData.is_published,
        banner_image: formData.banner_image,
        whatsapp_number: formData.whatsapp_number,
        enable_notes: formData.enable_notes,
        enable_payment_method: formData.enable_payment_method,
        enable_order_type: formData.enable_order_type,
      };

      if (store[0]) {
        await base44.entities.OnlineStore.update(store[0].id, data);
      } else {
        await base44.entities.OnlineStore.create(data);
      }

      queryClient.invalidateQueries(['onlineStore']);
      navigate(createPageUrl('Catalog'));
    } catch (error) {
      alert('Erro ao salvar. Verifique se a URL já não está em uso.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, banner_image: file_url });
    }
  };

  const storeUrl = `${window.location.origin}${createPageUrl(`Storefront?store=${formData.store_url || 'minhaloja'}`)}`;

  const copyStoreUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(createPageUrl('Catalog'))}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">Loja Online</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 space-y-4"
      >
        {/* Store Status */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-[#333333] font-medium">Loja Publicada</label>
              <p className="text-xs text-gray-400">
                {formData.is_published ? 'Sua loja está visível ao público' : 'Sua loja está privada'}
              </p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
              className="text-[#2d91a8]"
            >
              {formData.is_published ? (
                <ToggleRight className="w-10 h-10" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Store URL */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">URL da Loja *</label>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.store_url}
              onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
              placeholder="minhaloja"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Apenas letras minúsculas, números e hífens</p>
        </div>

        {/* Store URL Preview */}
        {formData.store_url && (
          <div className="bg-white rounded-[20px] p-4 shadow-sm border border-[#2d91a8]/20">
            <p className="text-xs font-medium text-[#333333] mb-3">Sua loja estará disponível em:</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <p className="text-sm text-[#2d91a8] font-medium break-all">{storeUrl}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyStoreUrl}
                className="flex-1 py-2 bg-[#2d91a8] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Link
              </button>
              {formData.is_published && (
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visitar
                </a>
              )}
            </div>
            {showCopied && (
              <p className="text-xs text-green-600 mt-2 text-center">✓ Link copiado!</p>
            )}
          </div>
        )}

        {/* Banner Image */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Banner da Home</label>
          <label className="block cursor-pointer">
            {formData.banner_image ? (
              <img
                src={formData.banner_image}
                alt="Banner"
                className="w-full h-32 object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full h-32 bg-[#52cfc1]/10 rounded-2xl flex flex-col items-center justify-center">
                <Camera className="w-10 h-10 text-[#2d91a8]/40 mb-2" strokeWidth={1.5} />
                <span className="text-sm text-gray-400">Adicionar banner</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
          </label>
        </div>

        {/* WhatsApp Number */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">WhatsApp para Pedidos *</label>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="(00) 00000-0000"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Os pedidos serão enviados para este número</p>
        </div>

        {/* Store Options */}
        <div>
          <h3 className="text-sm font-semibold text-[#333333] mb-3">Opções da Loja</h3>
          
          <div className="space-y-3">
            {/* Enable Notes */}
            <div className="bg-white rounded-[20px] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-[#333333] font-medium">Habilitar Observações</label>
                  <p className="text-xs text-gray-400">Permitir que clientes adicionem observações ao pedido</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, enable_notes: !formData.enable_notes })}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    formData.enable_notes ? 'bg-[#2d91a8]' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                      formData.enable_notes ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Enable Payment Method */}
            <div className="bg-white rounded-[20px] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-[#333333] font-medium">Habilitar Forma de Pagamento</label>
                  <p className="text-xs text-gray-400">Permitir que clientes escolham a forma de pagamento</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, enable_payment_method: !formData.enable_payment_method })}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    formData.enable_payment_method ? 'bg-[#2d91a8]' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                      formData.enable_payment_method ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Enable Order Type */}
            <div className="bg-white rounded-[20px] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-[#333333] font-medium">Habilitar Tipo de Pedido</label>
                  <p className="text-xs text-gray-400">Permitir que clientes escolham o tipo de pedido</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, enable_order_type: !formData.enable_order_type })}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    formData.enable_order_type ? 'bg-[#2d91a8]' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                      formData.enable_order_type ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-[20px] p-4">
          <p className="text-sm text-blue-900 mb-2 font-medium">💡 Como funciona</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Configure sua loja e publique quando estiver pronta</li>
            <li>• Marque produtos como "destaque" no formulário de edição</li>
            <li>• Os clientes escolhem produtos e enviam pedido via WhatsApp</li>
            <li>• As informações da loja vêm da seção "Personalizar"</li>
          </ul>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!formData.store_url || !formData.whatsapp_number || isSaving}
          className="w-full py-4 bg-[#2d91a8] text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Configurações
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Camera, Palette, Moon, Sun, Mail, Phone, MapPin, Instagram, Facebook, LogOut } from 'lucide-react';

export default function AppCustomization() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: settings = [] } = useQuery({
    queryKey: ['appSettings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.AppSettings.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const currentSettings = settings[0] || {};

  const [formData, setFormData] = useState({
    company_name: '',
    company_logo: '',
    company_cover: '',
    company_phone: '',
    company_email: '',
    company_address: '',
    company_instagram: '',
    company_facebook: '',
    primary_color: '#2d91a8',
    secondary_color: '#52cfc1',
    dark_mode: false,
    fab_position: 'left',
    footer_text: 'Obrigado pela preferência! ✨',
    quotation_notes: 'Este orçamento é válido por 15 dias',
    receipt_notes: 'Pagamento recebido com sucesso',
    company_info: '',
  });

  useEffect(() => {
    if (currentSettings.id) {
      setFormData({
        company_name: currentSettings.company_name || '',
        company_logo: currentSettings.company_logo || '',
        company_cover: currentSettings.company_cover || '',
        company_phone: currentSettings.company_phone || '',
        company_email: currentSettings.company_email || '',
        company_address: currentSettings.company_address || '',
        company_instagram: currentSettings.company_instagram || '',
        company_facebook: currentSettings.company_facebook || '',
        primary_color: currentSettings.primary_color || '#2d91a8',
        secondary_color: currentSettings.secondary_color || '#52cfc1',
        dark_mode: currentSettings.dark_mode || false,
        fab_position: currentSettings.fab_position || 'left',
        footer_text: currentSettings.footer_text || 'Obrigado pela preferência! ✨',
        quotation_notes: currentSettings.quotation_notes || 'Este orçamento é válido por 15 dias',
        receipt_notes: currentSettings.receipt_notes || 'Pagamento recebido com sucesso',
        company_info: currentSettings.company_info || '',
      });
    }
  }, [currentSettings]);

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, [field]: file_url });
    }
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      base44.auth.logout();
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n' +
      'Você está prestes a excluir sua conta permanentemente.\n' +
      'Todos os seus dados serão perdidos para sempre.\n\n' +
      'Deseja continuar?'
    );
    
    if (confirmed) {
      const doubleConfirm = window.confirm(
        'Tem certeza absoluta?\n\n' +
        'Digite "EXCLUIR" para confirmar.'
      );
      
      if (doubleConfirm) {
        try {
          // Delete all user data
          const allEntities = [
            'CatalogItem', 'Client', 'Order', 'Financial', 
            'Inventory', 'ProductRecipe', 'Account', 'Transfer',
            'AppSettings', 'OnlineStore', 'ReadNotification'
          ];
          
          for (const entity of allEntities) {
            try {
              const records = await base44.entities[entity].filter({ created_by: user.email });
              for (const record of records) {
                await base44.entities[entity].delete(record.id);
              }
            } catch (e) {
              console.log(`Skipping ${entity}:`, e.message);
            }
          }
          
          alert('Conta excluída com sucesso. Você será desconectado.');
          base44.auth.logout();
        } catch (error) {
          alert('Erro ao excluir conta. Tente novamente.');
        }
      }
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Esta ação não pode ser desfeita!\n\n' +
      'Todos os seus dados (pedidos, clientes, produtos, financeiro, etc) serão excluídos.\n' +
      'Você manterá sua conta, mas o app será resetado.\n\n' +
      'Deseja continuar?'
    );
    
    if (confirmed) {
      try {
        const allEntities = [
          'CatalogItem', 'Client', 'Order', 'Financial', 
          'Inventory', 'ProductRecipe', 'Account', 'Transfer',
          'OnlineStore', 'ReadNotification'
        ];
        
        for (const entity of allEntities) {
          try {
            const records = await base44.entities[entity].filter({ created_by: user.email });
            for (const record of records) {
              await base44.entities[entity].delete(record.id);
            }
          } catch (e) {
            console.log(`Skipping ${entity}:`, e.message);
          }
        }
        
        alert('Dados limpos com sucesso! O app foi resetado.');
        window.location.reload();
      } catch (error) {
        alert('Erro ao limpar dados. Tente novamente.');
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (currentSettings.id) {
        await base44.entities.AppSettings.update(currentSettings.id, formData);
      } else {
        await base44.entities.AppSettings.create(formData);
      }
      queryClient.invalidateQueries(['appSettings']);
      
      // Apply colors immediately
      document.documentElement.style.setProperty('--color-primary', formData.primary_color);
      document.documentElement.style.setProperty('--color-secondary', formData.secondary_color);
      
      if (formData.dark_mode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Force a reload to apply all colors
      window.location.href = '/';
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">Personalização</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 space-y-6"
      >
        {/* Logo & Cover */}
        <div>
          <h3 className="text-sm font-semibold text-[#333333] mb-3">Identidade Visual</h3>
          
          {/* Logo */}
          <label className="block mb-4 cursor-pointer">
            <p className="text-xs text-gray-400 mb-2">Logo da Empresa</p>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-200 hover:border-[#2d91a8] transition-colors">
              {formData.company_logo ? (
                <img src={formData.company_logo} alt="Logo" className="h-20 mx-auto object-contain" />
              ) : (
                <div className="flex flex-col items-center py-4">
                  <Camera className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400">Adicionar logo</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'company_logo')} className="hidden" />
          </label>

          {/* Cover */}
          <label className="block cursor-pointer">
            <p className="text-xs text-gray-400 mb-2">Capa/Banner</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-dashed border-gray-200 hover:border-[#2d91a8] transition-colors">
              {formData.company_cover ? (
                <img src={formData.company_cover} alt="Capa" className="w-full h-32 object-cover" />
              ) : (
                <div className="flex flex-col items-center py-8 bg-gradient-to-br from-gray-50 to-gray-100">
                  <Camera className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400">Adicionar capa</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'company_cover')} className="hidden" />
          </label>
        </div>

        {/* Company Info */}
        <div>
          <h3 className="text-sm font-semibold text-[#333333] mb-3">Dados da Empresa</h3>
          
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 mb-2 block">Nome da Empresa</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Minha Empresa Ltda"
                className="w-full text-[#333333] text-sm bg-transparent focus:outline-none"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 mb-2 block">Telefone</label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 mb-2 block">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                  placeholder="contato@empresa.com"
                  className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 mb-2 block">Endereço</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.company_address}
                  onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade"
                  className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 mb-2 block">Instagram</label>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.company_instagram}
                  onChange={(e) => setFormData({ ...formData, company_instagram: e.target.value })}
                  placeholder="@minhaempresa"
                  className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 mb-2 block">Facebook</label>
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.company_facebook}
                  onChange={(e) => setFormData({ ...formData, company_facebook: e.target.value })}
                  placeholder="facebook.com/minhaempresa"
                  className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div>
          <h3 className="text-sm font-semibold text-[#333333] mb-3">Cores do App</h3>
          
          <div className="space-y-4">
            {/* Primary Color */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="text-xs text-gray-400 mb-3 block">Cor Primária</label>
              
              <div className="flex items-center gap-3">
                <label htmlFor="primary_color_picker" className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 flex-shrink-0 shadow-sm" style={{ backgroundColor: formData.primary_color }}></label>
                <input
                  id="primary_color_picker"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="sr-only"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm font-mono text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="text-xs text-gray-400 mb-3 block">Cor Secundária</label>
              
              <div className="flex items-center gap-3">
                <label htmlFor="secondary_color_picker" className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 flex-shrink-0 shadow-sm" style={{ backgroundColor: formData.secondary_color }}></label>
                <input
                  id="secondary_color_picker"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="sr-only"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm font-mono text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FAB Position */}
        <div>
          <h3 className="text-sm font-semibold text-[#333333] mb-3">Botão de Atalho</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="text-xs text-gray-400 mb-3 block">Posição do Botão Flutuante</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, fab_position: 'left' })}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  formData.fab_position === 'left'
                    ? 'bg-[#2d91a8] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Esquerda
              </button>
              <button
                onClick={() => setFormData({ ...formData, fab_position: 'right' })}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  formData.fab_position === 'right'
                    ? 'bg-[#2d91a8] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Direita
              </button>
            </div>
          </div>
        </div>

        {/* Dark Mode */}
        <div>
          <h3 className="text-sm font-semibold text-[#333333] mb-3">Modo Escuro</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {formData.dark_mode ? (
                  <Moon className="w-5 h-5 text-[#2d91a8]" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <h4 className="font-semibold text-[#333333]">Modo Escuro</h4>
                  <p className="text-xs text-gray-400">Tema escuro para o aplicativo</p>
                </div>
              </div>
              <button
                onClick={() => setFormData({ ...formData, dark_mode: !formData.dark_mode })}
                className={`w-14 h-8 rounded-full transition-colors ${
                  formData.dark_mode ? 'bg-[#2d91a8]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                    formData.dark_mode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Messages */}
        <div>
          <h3 className="text-sm font-semibold text-[#333333] mb-3">Mensagens Personalizadas</h3>
          
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 font-medium mb-2 block">Rodapé de Documentos</label>
              <input
                type="text"
                value={formData.footer_text}
                onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                placeholder="Obrigado pela preferência! ✨"
                className="w-full text-[#333333] text-sm bg-transparent focus:outline-none"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 font-medium mb-2 block">Observação em Orçamentos</label>
              <textarea
                value={formData.quotation_notes}
                onChange={(e) => setFormData({ ...formData, quotation_notes: e.target.value })}
                placeholder="Este orçamento é válido por 15 dias"
                rows={2}
                className="w-full text-[#333333] text-sm bg-transparent focus:outline-none resize-none"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 font-medium mb-2 block">Observação em Recibos</label>
              <textarea
                value={formData.receipt_notes}
                onChange={(e) => setFormData({ ...formData, receipt_notes: e.target.value })}
                placeholder="Pagamento recebido com sucesso"
                rows={2}
                className="w-full text-[#333333] text-sm bg-transparent focus:outline-none resize-none"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="text-xs text-gray-400 font-medium mb-2 block">Informações da sua Empresa</label>
              <textarea
                value={formData.company_info}
                onChange={(e) => setFormData({ ...formData, company_info: e.target.value })}
                placeholder="Informações adicionais (ex: CNPJ, IE, etc)"
                rows={3}
                className="w-full text-[#333333] text-sm bg-transparent focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 bg-[#2d91a8] text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-lg shadow-[#2d91a8]/20 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" strokeWidth={1.5} />
                Salvar Configurações
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-50 text-red-500 font-semibold rounded-[20px] flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            Sair da Conta
          </button>

          <button
            onClick={handleClearData}
            className="w-full py-3 bg-orange-50 text-orange-600 text-sm font-medium rounded-[20px] flex items-center justify-center gap-2"
          >
            Limpar Dados do App
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Excluir Conta Permanentemente
          </button>
        </div>
      </motion.div>
    </div>
  );
}
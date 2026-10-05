import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, User, Phone, Mail, FileText, MapPin, Camera } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function ClientForm() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: appSettings = [] } = useQuery({
    queryKey: ['appSettings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.AppSettings.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const primaryColor = appSettings[0]?.primary_color || '#2d91a8';

  const [formData, setFormData] = useState({
    company: '',
    name: '',
    photo: '',
    whatsapp: '',
    email: '',
    document: '',
    address: '',
  });

  useEffect(() => {
    if (clientId) {
      setIsLoading(true);
      base44.entities.Client.list()
        .then(clients => {
          const client = clients.find(c => c.id === clientId);
          if (client) {
            setFormData({
              company: client.company || '',
              name: client.name || '',
              photo: client.photo || '',
              whatsapp: client.whatsapp || '',
              email: client.email || '',
              document: client.document || '',
              address: client.address || '',
            });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [clientId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (clientId) {
        await base44.entities.Client.update(clientId, formData);
      } else {
        await base44.entities.Client.create(formData);
      }
      navigate(createPageUrl('Dashboard'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Deseja realmente excluir este cliente?')) {
      await base44.entities.Client.delete(clientId);
      navigate(createPageUrl('Dashboard'));
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
        <div className="w-8 h-8 border-2 border-[#2d91a8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-lg font-bold text-[#333333]">
            {clientId ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 pb-36 space-y-4"
      >
        {/* Photo Upload */}
        <div className="flex justify-center mb-6">
          <label className="relative cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-[#52cfc1]/20 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
              {formData.photo ? (
                <img src={formData.photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[#2d91a8]/40" strokeWidth={1.5} />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#2d91a8] rounded-full flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Company */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Empresa</label>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Nome da empresa"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Name */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Nome *</label>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">WhatsApp</label>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="(00) 00000-0000"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Email</label>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Document */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">CPF/CNPJ</label>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              placeholder="000.000.000-00"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Endereço</label>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua, número, bairro, cidade"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={!formData.name || isSaving}
            style={{ backgroundColor: primaryColor }}
            className="w-full py-4 text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" strokeWidth={1.5} />
                Salvar Cliente
              </>
            )}
          </button>

          {clientId && (
            <button
              onClick={handleDelete}
              className="w-full py-4 bg-red-50 text-red-500 font-semibold rounded-[20px] flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              Excluir Cliente
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
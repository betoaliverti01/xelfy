import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function EventForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  const presetDate = urlParams.get('date');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Reunião',
    description: '',
    date: presetDate || new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    location: '',
    participants: '',
  });

  useEffect(() => {
    if (eventId) {
      setIsLoading(true);
      base44.entities.Event.list()
        .then(events => {
          const event = events.find(e => e.id === eventId);
          if (event) {
            setFormData({
              title: event.title || '',
              type: event.type || 'Reunião',
              description: event.description || '',
              date: event.date || '',
              start_time: event.start_time || '09:00',
              end_time: event.end_time || '10:00',
              location: event.location || '',
              participants: event.participants || '',
            });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [eventId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (eventId) {
        await base44.entities.Event.update(eventId, formData);
      } else {
        await base44.entities.Event.create(formData);
      }
      queryClient.invalidateQueries(['events']);
      navigate(createPageUrl('Schedule'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Deseja realmente excluir este evento?')) {
      await base44.entities.Event.delete(eventId);
      queryClient.invalidateQueries(['events']);
      navigate(createPageUrl('Schedule'));
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
          <h1 className="text-lg font-bold text-[#333333]">
            {eventId ? 'Editar Evento' : 'Novo Evento'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 space-y-4">
        {/* Type */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-3 block">Tipo</label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({ ...formData, type: 'Reunião' })}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                formData.type === 'Reunião' ? 'bg-[#2d91a8] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Reunião
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: 'Evento' })}
              className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                formData.type === 'Evento' ? 'bg-[#2d91a8] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Evento
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Digite o título"
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Data *</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Início</label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <label className="text-xs text-gray-400 font-medium mb-2 block">Término</label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Local</label>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Escritório, Zoom, etc"
              className="flex-1 text-[#333333] text-sm bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm">
          <label className="text-xs text-gray-400 font-medium mb-2 block">Participantes</label>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              placeholder="Ex: João, Maria..."
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
            placeholder="Detalhes do evento..."
            rows={3}
            className="w-full text-[#333333] text-sm bg-transparent focus:outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={!formData.title || !formData.date || isSaving}
            className="w-full py-4 bg-[#2d91a8] text-white font-semibold rounded-[20px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" strokeWidth={1.5} />
                Salvar
              </>
            )}
          </button>

          {eventId && (
            <button onClick={handleDelete} className="w-full py-4 bg-red-50 text-red-500 font-semibold rounded-[20px] flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              Excluir
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, AlertCircle, Check } from 'lucide-react';

export default function GoogleCalendarSettings() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(true);

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
          <h1 className="text-lg font-bold text-[#333333]">Google Agenda</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 space-y-4"
      >
        {/* Info Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Backend Functions Necessário</h3>
              <p className="text-sm text-amber-700 mb-3">
                Para integrar com o Google Agenda, é necessário habilitar Backend Functions no seu app.
              </p>
              <p className="text-xs text-amber-600">
                Acesse: Dashboard → Settings → Backend Functions
              </p>
            </div>
          </div>
        </div>

        {/* Integration Benefits */}
        <div className="bg-white rounded-[20px] p-5 shadow-sm">
          <h3 className="font-semibold text-[#333333] mb-4">Recursos da Integração</h3>
          <div className="space-y-3">
            {[
              'Sincronizar pedidos automaticamente',
              'Criar eventos no Google Agenda',
              'Notificações de compromissos',
              'Visualização integrada de agenda',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" strokeWidth={2} />
                </div>
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to Enable */}
        <div className="bg-white rounded-[20px] p-5 shadow-sm">
          <h3 className="font-semibold text-[#333333] mb-4">Como Habilitar</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
              <span>Acesse o Dashboard da Base44</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
              <span>Vá em Settings do seu app</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
              <span>Ative Backend Functions</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
              <span>Retorne aqui para conectar o Google Agenda</span>
            </li>
          </ol>
        </div>

        {/* Placeholder Connect Button (disabled) */}
        <button
          disabled
          className="w-full py-4 bg-gray-200 text-gray-400 font-semibold rounded-[20px] flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <Calendar className="w-5 h-5" strokeWidth={1.5} />
          Conectar Google Agenda
        </button>

        <p className="text-center text-xs text-gray-400">
          Este botão será ativado após habilitar Backend Functions
        </p>
      </motion.div>
    </div>
  );
}
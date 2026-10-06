import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, Share2, Download } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2canvas from 'html2canvas';

export default function QuotationView() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const contentRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [client, setClient] = useState(null);

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

  useEffect(() => {
    if (orderId) {
      Promise.all([
        base44.entities.Order.list(),
        base44.entities.Client.list()
      ])
        .then(([orders, clients]) => {
          const foundOrder = orders.find(o => o.id === orderId);
          if (foundOrder) {
            const foundClient = clients.find(c => c.id === foundOrder.client_id);
            setClient(foundClient);
          }
          setOrder(foundOrder);
          setIsLoading(false);
        });
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!contentRef.current || isDownloading) return;
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 3,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement('a');
      link.download = `orcamento-${order.id?.slice(-8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareImage = async () => {
    if (!contentRef.current || isDownloading) return;
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 3,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `orcamento-${order.id?.slice(-8)}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Orçamento',
              text: 'Orçamento gerado por xelfy'
            });
            setIsDownloading(false);
            return;
          } catch (err) {
            if (err.name === 'AbortError') {
              setIsDownloading(false);
              return;
            }
          }
        }
        
        // Direct download fallback
        const link = document.createElement('a');
        link.download = `orcamento-${order.id?.slice(-8)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsDownloading(false);
      });
    } catch (_) {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07151D] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#00485C] border-t-[#4BCBB4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#07151D] flex flex-col items-center justify-center gap-3">
        <p className="text-white font-semibold">Orçamento não encontrado</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#00485C] text-white rounded-xl text-xs font-bold"
        >
          Voltar
        </button>
      </div>
    );
  }

  const companySettings = settings[0] || {};
  const validUntil = order.order_date ? addDays(new Date(order.order_date), 15) : null;

  return (
    <div className="min-h-screen bg-[#07151D] text-white pb-20">
      {/* Header - Hidden on print */}
      <div className="bg-[#0D222E] border-b border-[#1C4156] px-5 pt-10 pb-5 shadow-sm print:hidden">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">Visualização de Orçamento</h1>
            <p className="text-xs text-[#8EB3BD]">Pronto para envio ou impressão</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Imprimir"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
            >
              <Printer className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              onClick={handleShareImage}
              title="Compartilhar imagem"
              disabled={isDownloading}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-teal-950/40"
            >
              <Share2 className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Quotation Document - Always crisp white paper background for 100% readability */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-6"
      >
        <div 
          ref={contentRef} 
          className="quotation-paper bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none border border-slate-200"
          style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}
        >
          {/* Header Banner */}
          <div className="bg-[#00485C] text-white p-6 border-b border-[#0A3342]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {companySettings.company_logo ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white p-1 shadow-md flex-shrink-0">
                    <img src={companySettings.company_logo} alt="Logo" className="w-full h-full object-contain" crossOrigin="anonymous" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/15 border border-white/30 p-1 flex items-center justify-center flex-shrink-0">
                    <img src="/logo.png" alt="xelfy" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-white tracking-tight truncate">
                    {companySettings.company_name || user?.full_name || 'xelfy Negócios'}
                  </h2>
                  {companySettings.company_phone && (
                    <p className="text-xs text-teal-100 font-medium">WhatsApp / Tel: {companySettings.company_phone}</p>
                  )}
                  {companySettings.company_email && (
                    <p className="text-xs text-teal-100">{companySettings.company_email}</p>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="inline-block px-3 py-1 bg-white text-[#00485C] font-black text-xs uppercase tracking-widest rounded-lg shadow-sm">
                  ORÇAMENTO
                </span>
                <p className="text-xs text-teal-100 font-semibold mt-1">
                  #{order.id?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Client & Metadata Info */}
          <div className="bg-slate-50 p-5 border-b border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-0.5">Cliente</span>
                <p className="font-bold text-slate-900 text-sm">
                  {client?.company || client?.name || order.client_name || 'Cliente'}
                </p>
                {client?.whatsapp && (
                  <p className="text-slate-500 text-[11px] mt-0.5">{client.whatsapp}</p>
                )}
              </div>
              <div>
                <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-0.5">Data de Emissão</span>
                <p className="font-bold text-slate-900 text-sm">
                  {order.order_date ? format(new Date(order.order_date), "dd/MM/yyyy", { locale: ptBR }) : format(new Date(), "dd/MM/yyyy")}
                </p>
              </div>
              <div>
                <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-0.5">Validade da Proposta</span>
                <p className="font-bold text-[#00485C] text-sm">
                  {validUntil ? format(validUntil, "dd/MM/yyyy", { locale: ptBR }) : '15 dias'}
                </p>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="p-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Itens do Orçamento
            </h4>
            <div className="space-y-2.5">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/90 rounded-xl">
                    <div className="flex-1 pr-3">
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.quantity} {item.unit || 'un'} × R$ {(item.unit_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black text-[#00485C]">
                        R$ {(item.total || ((item.quantity || 1) * (item.unit_price || 0))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-slate-900">Serviços / Produtos</span>
                  <span className="font-black text-[#00485C]">R$ {(order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            {/* Notes if present */}
            {order.notes && (
              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <h5 className="font-bold text-slate-900 text-xs mb-1">Observações do Pedido:</h5>
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{order.notes}</p>
              </div>
            )}

            {/* Totals Box */}
            <div className="mt-6 pt-4 border-t-2 border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Subtotal dos Itens:</span>
                <span className="text-slate-900 font-bold">
                  R$ {(order.subtotal || order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>Desconto Aplicado:</span>
                  <span>-R$ {order.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                <span className="text-base font-black text-slate-900 tracking-tight">TOTAL DO ORÇAMENTO:</span>
                <div className="bg-[#00485C] text-white px-4 py-2 rounded-xl shadow-md">
                  <span className="text-xl font-black text-white">
                    R$ {(order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Document Footer */}
          <div className="p-5 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-600 space-y-1.5">
            {companySettings.quotation_notes && (
              <p className="font-bold text-[#00485C] text-xs">
                {companySettings.quotation_notes}
              </p>
            )}
            {companySettings.company_address && (
              <p className="text-[11px] text-slate-500">{companySettings.company_address}</p>
            )}
            {companySettings.company_info && (
              <p className="text-[11px] text-slate-500 whitespace-pre-wrap">{companySettings.company_info}</p>
            )}
            <p className="text-[10px] text-slate-400 pt-1 font-semibold uppercase tracking-wider">
              Documento gerado por xelfy • Gestão & Loja Online
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating Action Button (Download Image) */}
      <div className="fixed bottom-6 right-6 print:hidden z-30">
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          title="Salvar imagem nítida em PNG"
          className="h-14 px-5 bg-gradient-to-r from-[#238799] via-[#34A8A6] to-[#4BCBB4] text-gray-950 font-black rounded-full shadow-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span className="text-xs uppercase tracking-wider font-extrabold">Baixar Imagem PNG</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        /* Isolate quotation document from dark mode overrides so html2canvas renders pure crisp contrast */
        .quotation-paper,
        .quotation-paper * {
          color-scheme: light !important;
        }
        .quotation-paper {
          background-color: #FFFFFF !important;
          color: #0F172A !important;
        }
        .quotation-paper .bg-white {
          background-color: #FFFFFF !important;
        }
        .quotation-paper .bg-slate-50 {
          background-color: #F8FAFC !important;
        }
        .quotation-paper .bg-slate-100 {
          background-color: #F1F5F9 !important;
        }
        .quotation-paper .border-slate-200 {
          border-color: #E2E8F0 !important;
        }
        .quotation-paper .text-slate-900 {
          color: #0F172A !important;
        }
        .quotation-paper .text-slate-600 {
          color: #475569 !important;
        }
        .quotation-paper .text-slate-500 {
          color: #64748B !important;
        }

        @media print {
          body { margin: 0; padding: 0; background: #fff !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
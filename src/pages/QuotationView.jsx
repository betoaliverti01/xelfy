import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, Share2, Calendar, Download, Image } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import { generateOrderWhatsAppMessage } from '@/components/utils/WhatsAppMessage';

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
        scale: 2,
        backgroundColor: '#FAFAFA',
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
        scale: 2,
        backgroundColor: '#FAFAFA',
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
              text: 'Orçamento'
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
        
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const url = `https://wa.me/?text=${encodeURIComponent(file_url)}`;
        window.open(url, '_blank');
        setIsDownloading(false);
      });
    } catch (error) {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const text = generateOrderWhatsAppMessage(order, settings[0] || {});
    
    if (navigator.share) {
      try {
        await navigator.share({
          text: text,
          title: 'Orçamento'
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4A5D23] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-gray-400">Orçamento não encontrado</p>
      </div>
    );
  }

  const companySettings = settings[0] || {};
  const validUntil = order.order_date ? addDays(new Date(order.order_date), 15) : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header - Hidden on print */}
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm print:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">Orçamento</h1>
          <button
            onClick={handlePrint}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Printer className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Receipt Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-5 py-6"
      >
        <div ref={contentRef} className="bg-white rounded-[20px] shadow-lg overflow-hidden print:shadow-none">
          {/* Company Header */}
          {companySettings.company_cover && (
            <div className="h-24 bg-gradient-to-br from-[#4A5D23] to-[#6b7f3a] relative overflow-hidden">
              <img src={companySettings.company_cover} alt="Capa" className="w-full h-full object-cover" crossOrigin="anonymous" />
            </div>
          )}

          <div className="p-6 border-b">
            <div className="flex items-center gap-4 mb-6">
              {companySettings.company_logo && (
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-md flex-shrink-0">
                  <img src={companySettings.company_logo} alt="Logo" className="w-full h-full object-contain" crossOrigin="anonymous" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#333333] mb-1">
                  {companySettings.company_name || user?.full_name || 'Minha Empresa'}
                </h2>
                {companySettings.company_phone && (
                  <p className="text-sm text-gray-500">{companySettings.company_phone}</p>
                )}
                {companySettings.company_email && (
                  <p className="text-sm text-gray-500">{companySettings.company_email}</p>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#333333] text-center mb-4">ORÇAMENTO</h3>
          </div>

          {/* Order Info */}
          <div className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Cliente</p>
                <p className="font-semibold text-[#333333]">{client?.company || client?.name || order.client_name || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Data</p>
                <p className="font-semibold text-[#333333]">
                  {order.order_date ? format(new Date(order.order_date), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Nº do Orçamento</p>
                <p className="font-semibold text-[#333333]">#{order.id?.slice(-8).toUpperCase()}</p>
              </div>
              {validUntil && (
                <div>
                  <p className="text-gray-500 mb-1">Validade</p>
                  <p className="font-semibold text-[#333333]">
                    {format(validUntil, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="p-6">
            <h4 className="font-semibold text-[#333333] mb-4">Itens do Orçamento</h4>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-[#333333]">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity}x R$ {item.unit_price?.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold text-[#4A5D23]">
                    R$ {item.total?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            </div>

            {/* Notes */}
            {order.notes && (
            <div className="p-6 border-t bg-gray-50">
              <h4 className="font-semibold text-[#333333] mb-2">Observações</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.notes}</p>
            </div>
            )}

            {/* Totals */}
          <div className="p-6 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>R$ {order.subtotal?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Desconto</span>
                  <span>-R$ {order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-[#333333] pt-2 border-t">
                <span>TOTAL</span>
                <span className="text-[#4A5D23]">R$ {order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-[#F5F5DC] text-center">
            {companySettings.quotation_notes && (
              <p className="text-sm text-gray-600 mb-3">
                <strong>{companySettings.quotation_notes}</strong>
              </p>
            )}

            {companySettings.company_info && (
              <p className="text-xs text-gray-600 mb-3 whitespace-pre-wrap">
                {companySettings.company_info}
              </p>
            )}

            {companySettings.company_address && (
              <p className="text-xs text-gray-500 mb-2">{companySettings.company_address}</p>
            )}

            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              {companySettings.company_instagram && (
                <span>{companySettings.company_instagram}</span>
              )}
              {companySettings.company_facebook && (
                <span>{companySettings.company_facebook}</span>
              )}
            </div>

            {companySettings.footer_text && (
              <p className="text-xs text-gray-400 mt-3">
                {companySettings.footer_text.replace(/✨/g, '').replace(/🙏/g, '').trim()}
              </p>
            )}
          </div>
          </div>
          </motion.div>

      {/* Action Buttons - Hidden on print */}
      <div className="fixed bottom-6 right-6 print:hidden">
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-6 h-6 text-white" strokeWidth={2} />
          )}
        </button>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
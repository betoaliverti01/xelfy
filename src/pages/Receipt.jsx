import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import { generateReceiptWhatsAppMessage } from '@/components/utils/WhatsAppMessage';
import { formatCurrency } from '@/components/utils/formatCurrency';

export default function Receipt() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  const [order, setOrder] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const contentRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [financialPayments, setFinancialPayments] = React.useState([]);
  const [client, setClient] = React.useState(null);

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

  React.useEffect(() => {
    if (orderId) {
      Promise.all([
        base44.entities.Order.list(),
        base44.entities.Financial.filter({ order_id: orderId, type: 'Receita' }),
        base44.entities.Client.list()
      ])
        .then(([orders, payments, clients]) => {
          const found = orders.find(o => o.id === orderId);
          if (found) {
            if (found.installment_details) {
              // Atualizar status das parcelas com base nos pagamentos financeiros
              const updatedInstallments = found.installment_details.map(installment => {
                // Buscar pagamento correspondente - pode ter vários formatos de descrição
                const payment = payments.find(p => {
                  if (p.status !== 'Pago') return false;
                  
                  // Verificar se a descrição menciona esta parcela específica
                  const desc = p.description || '';
                  const matchesParcel = desc.includes(`Parcela ${installment.number}/`);
                  
                  return matchesParcel;
                });
                
                if (payment) {
                  return {
                    ...installment,
                    status: 'Pago',
                    payment_date: payment.payment_date
                  };
                }
                return installment;
              });
              
              found.installment_details = updatedInstallments;
            }
            
            // Buscar dados do cliente
            const foundClient = clients.find(c => c.id === found.client_id);
            setClient(foundClient);
          }
          setOrder(found);
          setFinancialPayments(payments);
        })
        .finally(() => setIsLoading(false));
    }
  }, [orderId]);

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
      link.download = `recibo-${order.id?.slice(-8)}.png`;
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
        const file = new File([blob], `recibo-${order.id?.slice(-8)}.png`, { type: 'image/png' });
        
        // Try Web Share API first
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Recibo de Pagamento',
              text: 'Recibo de Pagamento'
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
        
        // Fallback: upload and share via WhatsApp
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
    const text = generateReceiptWhatsAppMessage(order, settings[0] || {});
    
    // Try Web Share API first (opens native share menu)
    if (navigator.share) {
      try {
        await navigator.share({
          text: text,
          title: 'Recibo de Pagamento'
        });
        return;
      } catch (err) {
        // User cancelled or error - fallback to WhatsApp
        if (err.name === 'AbortError') return;
      }
    }
    
    // Fallback to WhatsApp
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
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
        <p className="text-gray-400">Pedido não encontrado</p>
      </div>
    );
  }

  const companySettings = settings[0] || {};

  return (
    <div className="min-h-screen bg-[#07151D] text-white pb-20">
      {/* Header */}
      <div className="bg-[#0D222E] border-b border-[#1C4156] px-5 pt-10 pb-5 shadow-sm print:hidden">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-white">Recibo de Pagamento</h1>
          <button
            onClick={handlePrint}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
          >
            <Printer className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Receipt Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-5 py-6"
      >
        <div 
          ref={contentRef} 
          className="receipt-paper bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none border border-slate-200"
          style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}
        >
          {/* Company Header */}
          {companySettings.company_cover ? (
            <div className="h-24 bg-gradient-to-br from-[#00485C] to-[#0A3342] relative overflow-hidden">
              <img src={companySettings.company_cover} alt="Capa" className="w-full h-full object-cover" crossOrigin="anonymous" />
            </div>
          ) : (
            <div className="h-4 bg-[#00485C]" />
          )}

          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              {companySettings.company_logo && (
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-md flex-shrink-0">
                  <img src={companySettings.company_logo} alt="Logo" className="w-full h-full object-contain" crossOrigin="anonymous" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {companySettings.company_name || user?.full_name || 'Minha Empresa'}
                </h2>
                {companySettings.company_phone && (
                  <p className="text-sm text-slate-500">{companySettings.company_phone}</p>
                )}
                {companySettings.company_email && (
                  <p className="text-sm text-slate-500">{companySettings.company_email}</p>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-black text-[#00485C] text-center mb-4 uppercase tracking-wider">RECIBO DE PAGAMENTO</h3>
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
                <p className="text-gray-500 mb-1">Nº do Recibo</p>
                <p className="font-semibold text-[#333333]">#{order.id?.slice(-8).toUpperCase()}</p>
              </div>
              {order.payment_method && (
                <div>
                  <p className="text-gray-500 mb-1">Forma de Pagamento</p>
                  <p className="font-semibold text-green-600">{order.payment_method}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="p-6">
            <h4 className="font-semibold text-[#333333] mb-4">Itens do Recibo</h4>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-[#333333]">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity}x {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-semibold text-[#4A5D23]">
                    {formatCurrency(item.total)}
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

            {/* Installments and Totals */}
          <div className="p-6 border-t">
            <h4 className="font-semibold text-[#333333] mb-4">Detalhes de Pagamento</h4>
            {order.installment_details && order.installment_details.length > 0 ? (
              <div className="space-y-3">
                {order.installment_details.map((installment, idx) => {
                  const paymentDate = installment.payment_date ? format(new Date(installment.payment_date), "dd/MM/yyyy", { locale: ptBR }) : '-';
                  return (
                    <div key={idx} className="flex justify-between text-sm items-center">
                      <span className="text-gray-600">
                        Parcela {installment.number}/{order.installments} (Vencimento: {format(new Date(installment.due_date), "dd/MM/yyyy", { locale: ptBR })})
                      </span>
                      <span className={`font-semibold ${installment.status === 'Pago' ? 'text-green-600' : 'text-amber-600'}`}>
                        {installment.status === 'Pago' ? `Pago em ${paymentDate}` : 'Aberto'} - {formatCurrency(installment.amount)}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Desconto</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Total do Pedido</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-[#333333] pt-2 border-t">
                    <span>TOTAL PAGO</span>
                    <span className="text-green-600">
                      {formatCurrency(order.installment_details.filter(i => i.status === 'Pago').reduce((sum, i) => sum + (i.amount || 0), 0))}
                    </span>
                  </div>
                  {(() => {
                    const faltaReceber = order.installment_details.filter(i => i.status === 'Pendente').reduce((sum, i) => sum + (i.amount || 0), 0);
                    return faltaReceber > 0 ? (
                      <div className="flex justify-between text-xl font-bold text-[#333333]">
                        <span>FALTA RECEBER</span>
                        <span className="text-red-500">
                          {formatCurrency(faltaReceber)}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Desconto</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-900 pt-3 border-t border-slate-200">
                  <span>TOTAL</span>
                  <span className="text-[#00485C]">{formatCurrency(order.total)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 text-center">
            {companySettings.receipt_notes && (
              <p className="text-sm text-slate-700 mb-3">
                <strong>{companySettings.receipt_notes}</strong>
              </p>
            )}

            {companySettings.company_info && (
              <p className="text-xs text-slate-600 mb-3 whitespace-pre-wrap">
                {companySettings.company_info}
              </p>
            )}

            {companySettings.company_address && (
              <p className="text-xs text-slate-500 mb-2">{companySettings.company_address}</p>
            )}

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              {companySettings.company_instagram && (
                <span>{companySettings.company_instagram}</span>
              )}
              {companySettings.company_facebook && (
                <span>{companySettings.company_facebook}</span>
              )}
            </div>

            {companySettings.footer_text && (
              <p className="text-xs text-slate-400 mt-3">
                {companySettings.footer_text.replace(/✨/g, '').replace(/🙏/g, '').trim()}
              </p>
            )}
          </div>
          </div>
          </motion.div>

      {/* Action Buttons - Hidden on print */}
      <div className="fixed bottom-6 right-6 print:hidden z-50">
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          title="Baixar Imagem PNG"
          className="w-14 h-14 bg-gradient-to-r from-[#238799] to-[#34A8A6] text-gray-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 border-2 border-white/20"
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-6 h-6 text-gray-950" strokeWidth={2.5} />
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
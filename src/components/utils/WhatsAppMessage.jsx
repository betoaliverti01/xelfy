import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const generateOrderWhatsAppMessage = (order, companySettings = {}) => {
  const {
    company_name = 'Nossa Empresa',
    company_phone = '',
    company_email = '',
    company_address = '',
    company_instagram = '',
    company_facebook = '',
  } = companySettings;

  const items = order.items?.map(i => 
    `${i.name}\n   ${i.quantity}x R$ ${i.unit_price?.toFixed(2)} = *R$ ${i.total?.toFixed(2)}*`
  ).join('\n\n') || '';

  const dateStr = order.order_date ? format(new Date(order.order_date), "dd/MM/yyyy", { locale: ptBR }) : '-';
  const dueStr = order.due_date ? format(new Date(order.due_date), "dd/MM/yyyy", { locale: ptBR }) : '-';

  let message = `*${order.status === 'Orçamento' ? 'ORCAMENTO' : 'PEDIDO'}*\n\n`;
  
  message += `*Documento N:* ${order.id?.slice(-8).toUpperCase() || '-'}\n`;
  message += `*Data:* ${dateStr}\n`;
  
  if (order.status !== 'Orçamento') {
    message += `*Vencimento:* ${dueStr}\n`;
  }
  
  message += `\n*Cliente:* ${order.client_name || '-'}\n`;
  
  message += `\n*ITENS DO PEDIDO*\n\n`;
  message += items;
  
  if (order.notes) {
    message += `\n\n*Observacoes:*\n${order.notes}`;
  }
  
  message += `\n\n*VALORES*\n\n`;
  message += `Subtotal: R$ ${order.subtotal?.toFixed(2) || '0,00'}\n`;
  
  if (order.discount > 0) {
    message += `Desconto: -R$ ${order.discount?.toFixed(2)}\n`;
  }
  
  message += `\n*TOTAL: R$ ${order.total?.toFixed(2) || '0,00'}*\n`;
  
  message += `\n*${company_name}*\n`;
  
  if (company_phone) message += `${company_phone}\n`;
  if (company_email) message += `${company_email}\n`;
  if (company_address) message += `${company_address}\n`;
  
  if (company_instagram) message += `Instagram: ${company_instagram}\n`;
  if (company_facebook) message += `Facebook: ${company_facebook}\n`;
  
  message += `\nObrigado pela preferencia!`;

  return message;
};

export const generateReceiptWhatsAppMessage = (order, companySettings = {}) => {
  const message = generateOrderWhatsAppMessage(order, companySettings);
  return message.replace('PEDIDO', 'RECIBO DE PAGAMENTO');
};
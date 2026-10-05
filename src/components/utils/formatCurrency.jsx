/**
 * Formata um número para o padrão de moeda brasileira
 * @param {number} value - O valor a ser formatado
 * @returns {string} - Valor formatado como R$ 0.000,00
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
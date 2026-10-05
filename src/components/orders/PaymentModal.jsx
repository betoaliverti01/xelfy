import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Banknote, DollarSign, Calendar } from 'lucide-react';
import { format, addMonths } from 'date-fns';

const paymentMethods = [
  { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote },
  { id: 'PIX', label: 'PIX', icon: Smartphone },
  { id: 'Cartão Débito', label: 'Débito', icon: CreditCard },
  { id: 'Cartão Crédito', label: 'Crédito', icon: CreditCard },
  { id: 'Boleto', label: 'Boleto', icon: DollarSign },
];

export default function PaymentModal({ isOpen, onClose, order, onConfirm }) {
  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    installments: 1,
    payment_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [customInstallments, setCustomInstallments] = useState([]);

  React.useEffect(() => {
    if (isOpen && order && paymentData.installments > 0) {
      initializeCustomInstallments(paymentData.installments);
    }
  }, [isOpen, order, paymentData.installments, paymentData.payment_date]);

  const handleConfirm = () => {
    onConfirm({
      ...paymentData,
      installment_details: customInstallments,
    });
  };

  const initializeCustomInstallments = (numInstallments) => {
    const newInstallments = [];
    const baseAmount = order.total / numInstallments;
    
    for (let i = 0; i < numInstallments; i++) {
      const existingInstallment = customInstallments[i];
      
      newInstallments.push({
        number: i + 1,
        amount: existingInstallment?.amount || parseFloat(baseAmount.toFixed(2)),
        due_date: existingInstallment?.due_date || format(addMonths(new Date(paymentData.payment_date), i), 'yyyy-MM-dd'),
        status: existingInstallment?.status || 'Pendente',
        payment_date: existingInstallment?.payment_date || null,
        interest_amount: existingInstallment?.interest_amount || 0,
      });
    }
    
    setCustomInstallments(newInstallments);
  };

  const updateCustomInstallment = (index, field, value) => {
    const updated = [...customInstallments];
    const numValue = parseFloat(value) || 0;
    updated[index][field] = field === 'due_date' ? value : numValue;

    if (field === 'amount' || field === 'interest_amount') {
      const currentTotal = updated.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0) + (parseFloat(inst.interest_amount) || 0), 0);
      const remainingAmount = order.total - currentTotal;
      
      const remainingInstallments = updated.slice(index + 1).filter(inst => inst.status === 'Pendente');
      if (remainingInstallments.length > 0 && Math.abs(remainingAmount) > 0.01) {
        const distributedAmount = remainingAmount / remainingInstallments.length;
        for (let i = index + 1; i < updated.length; i++) {
          if (updated[i].status === 'Pendente') {
            updated[i].amount = parseFloat((updated[i].amount + distributedAmount).toFixed(2));
          }
        }
      }
    }
    
    setCustomInstallments(updated);
  };

  const getTotalCustomInstallments = () => {
    return customInstallments.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0) + (parseFloat(inst.interest_amount) || 0), 0);
  };

  const addNewInstallment = () => {
    const lastInstallment = customInstallments[customInstallments.length - 1];
    const newDueDate = lastInstallment 
      ? format(addMonths(new Date(lastInstallment.due_date), 1), 'yyyy-MM-dd')
      : format(addMonths(new Date(paymentData.payment_date), customInstallments.length), 'yyyy-MM-dd');
    
    const newInstallment = {
      number: customInstallments.length + 1,
      amount: 0,
      due_date: newDueDate,
      status: 'Pendente',
      payment_date: null,
      interest_amount: 0,
    };
    
    setCustomInstallments([...customInstallments, newInstallment]);
    setPaymentData({ ...paymentData, installments: customInstallments.length + 1 });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="bg-white rounded-t-[32px] w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Receber Pagamento</h2>
              <button onClick={onClose}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div style={{ backgroundColor: 'var(--color-secondary)' }} className="bg-opacity-20 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total a Receber</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                R$ {order.total?.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-5 space-y-4">
            {/* Payment Method */}
            <div>
              <label className="text-sm font-semibold text-[#333333] mb-3 block">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentData({ ...paymentData, payment_method: method.id })}
                      style={paymentData.payment_method === method.id ? {
                        borderColor: 'var(--color-primary)',
                        backgroundColor: 'var(--color-primary)0d'
                      } : {}}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        paymentData.payment_method === method.id
                          ? ''
                          : 'border-gray-200'
                      }`}
                    >
                      <Icon 
                        className="w-6 h-6 mx-auto mb-2"
                        style={paymentData.payment_method === method.id ? { color: 'var(--color-primary)' } : {}}
                        {...(paymentData.payment_method !== method.id && { className: "w-6 h-6 mx-auto mb-2 text-gray-400" })}
                      />
                      <p 
                        className="text-sm font-medium"
                        style={paymentData.payment_method === method.id ? { color: 'var(--color-primary)' } : {}}
                        {...(paymentData.payment_method !== method.id && { className: "text-sm font-medium text-gray-600" })}
                      >
                        {method.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label className="text-sm font-semibold text-[#333333] mb-2 block">
                Data do Pagamento
              </label>
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                  className="flex-1 bg-transparent text-[#333333] focus:outline-none"
                />
              </div>
            </div>

            {/* Installments */}
            {paymentData.payment_method && (
              <div>
                <label className="text-sm font-semibold text-[#333333] mb-2 block">
                  Número de Parcelas
                </label>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={paymentData.installments}
                    onChange={(e) => {
                      const newInstallments = parseInt(e.target.value);
                      setPaymentData({ ...paymentData, installments: newInstallments });
                      initializeCustomInstallments(newInstallments);
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-600">
                      {paymentData.installments} parcela{paymentData.installments > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">
                      Total: R$ {order.total?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Installment Preview */}
                {customInstallments.length > 0 && (
                  <div className="mt-3 bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs text-gray-500 mb-3 font-semibold">Parcelas (Personalizáveis):</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {customInstallments.map((installment, index) => (
                        <div key={index} className="bg-white rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-600 w-12">
                              {installment.number}/{paymentData.installments}
                            </span>
                            <input
                              type="date"
                              value={installment.due_date}
                              onChange={(e) => updateCustomInstallment(index, 'due_date', e.target.value)}
                              className="text-xs text-gray-600 px-2 py-1 bg-gray-50 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 flex-1">
                              <span className="text-xs text-gray-500">Valor:</span>
                              <input
                                type="number"
                                step="0.01"
                                value={installment.amount}
                                onChange={(e) => updateCustomInstallment(index, 'amount', e.target.value)}
                                className="flex-1 text-xs font-semibold px-2 py-1 bg-gray-50 rounded text-right focus:outline-none focus:ring-2 focus:ring-[#2d91a8]/20"
                                style={{ color: 'var(--color-primary)' }}
                              />
                            </div>
                            <div className="flex items-center gap-1 flex-1">
                              <span className="text-xs text-gray-500">Juros:</span>
                              <input
                                type="number"
                                step="0.01"
                                value={installment.interest_amount}
                                onChange={(e) => updateCustomInstallment(index, 'interest_amount', e.target.value)}
                                className="flex-1 text-xs font-semibold px-2 py-1 bg-gray-50 rounded text-right focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">Total: </span>
                            <span className="text-sm font-bold text-[#2d91a8]">
                              R$ {((parseFloat(installment.amount) || 0) + (parseFloat(installment.interest_amount) || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addNewInstallment}
                      className="w-full mt-2 py-2 text-xs text-[#2d91a8] border-2 border-dashed border-[#2d91a8]/30 rounded-xl hover:bg-[#2d91a8]/5 transition-colors"
                    >
                      + Adicionar Parcela
                    </button>
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Original:</span>
                        <span className="font-semibold">R$ {order.total?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total com Parcelas/Juros:</span>
                        <span className={`text-lg font-bold ${Math.abs(getTotalCustomInstallments() - order.total) > 0.01 ? 'text-amber-600' : 'text-green-600'}`}>
                          R$ {getTotalCustomInstallments().toFixed(2)}
                        </span>
                      </div>
                      {Math.abs(getTotalCustomInstallments() - order.total) > 0.01 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                          <p className="text-xs text-amber-700">
                            {getTotalCustomInstallments() > order.total 
                              ? `✓ Incluindo R$ ${(getTotalCustomInstallments() - order.total).toFixed(2)} em juros/ajustes`
                              : `⚠️ Diferença de R$ ${(order.total - getTotalCustomInstallments()).toFixed(2)} a ajustar`
                            }
                          </p>
                        </div>
                      )}
                      </div>
                      </div>
                      )}
                      </div>
                      )}
                      </div>

                      {/* Actions */}
          <div className="p-5 border-t space-y-3 bg-white">
            <button
              onClick={handleConfirm}
              disabled={!paymentData.payment_method}
              style={{ backgroundColor: 'var(--color-primary)' }}
              className="w-full py-4 text-white font-semibold rounded-[20px] disabled:opacity-50"
            >
              Confirmar Recebimento
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-100 text-gray-600 font-semibold rounded-[20px]"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
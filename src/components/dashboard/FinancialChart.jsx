import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-semibold text-[#333333]">
          R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-gray-500">{payload[0].payload.label}</p>
      </div>
    );
  }
  return null;
};

export default function FinancialChart({ data }) {
  const navigate = useNavigate();
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const handleBarClick = (entry) => {
    if (entry.name === 'Receita') {
      navigate(createPageUrl(`FinancialList?type=income&month=${currentMonthKey}`));
    } else if (entry.name === 'Despesa') {
      navigate(createPageUrl(`FinancialList?type=expense&month=${currentMonthKey}`));
    } else if (entry.name === 'Lucro') {
      navigate(createPageUrl(`FinancialList?type=profit&month=${currentMonthKey}`));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-[20px] p-5 shadow-sm col-span-2"
    >
      <h3 className="text-sm font-semibold text-[#333333] mb-4">Balanço</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar 
            dataKey="value" 
            radius={[8, 8, 0, 0]} 
            barSize={60}
            onClick={(data) => handleBarClick(data)}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.name === 'Receita' ? '#10b981' :
                  entry.name === 'Despesa' ? '#ef4444' :
                  '#2d91a8'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Package, Wrench, Edit2 } from 'lucide-react';

export default function CatalogCard({ item, viewMode = 'grid', onClick }) {
  const isProduct = item.type === 'Produto';

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex gap-3 p-3">
          {item.photo ? (
            <img
              src={item.photo}
              alt={item.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#52cfc1]/20 to-[#2d91a8]/20 flex items-center justify-center flex-shrink-0">
              {isProduct ? (
                <Package className="w-8 h-8 text-[#2d91a8]/40" strokeWidth={1.5} />
              ) : (
                <Wrench className="w-8 h-8 text-[#2d91a8]/40" strokeWidth={1.5} />
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-[#333333] text-sm truncate flex-1">{item.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                isProduct ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {item.type}
              </span>
            </div>
            
            {item.description && (
              <p className="text-xs text-gray-500 mb-2 line-clamp-1">{item.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-[#2d91a8]">
                R$ {(item.sale_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              
              {isProduct && item.control_stock && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {item.stock || 0} un
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-[#52cfc1]/20 to-[#2d91a8]/20 flex items-center justify-center">
            {isProduct ? (
              <Package className="w-10 h-10 text-[#2d91a8]/40" strokeWidth={1.5} />
            ) : (
              <Wrench className="w-10 h-10 text-[#2d91a8]/40" strokeWidth={1.5} />
            )}
          </div>
        )}
        <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-medium ${
          isProduct ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {item.type}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[#333333] text-sm mb-1 truncate">{item.name}</h3>
        
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-[#2d91a8]">
            R$ {(item.sale_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          
          {isProduct && item.control_stock && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              item.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {item.stock || 0} un
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
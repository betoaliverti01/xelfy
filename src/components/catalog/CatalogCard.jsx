import React from 'react';
import { motion } from 'framer-motion';
import { Package, Wrench } from 'lucide-react';

export default function CatalogCard({ item, viewMode = 'grid', onClick }) {
  const isProduct = item.type === 'Produto';

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-[#0D222E] rounded-2xl overflow-hidden shadow-sm border border-[#1C4156] hover:border-[#34A8A6]/60 hover:shadow-lg transition-all duration-200 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex gap-3.5 p-3.5 items-center">
          {item.photo ? (
            <img
              src={item.photo}
              alt={item.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 border border-[#1C4156]"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#133345] border border-[#1C4156] flex items-center justify-center flex-shrink-0">
              {isProduct ? (
                <Package className="w-7 h-7 text-[#4BCBB4]" strokeWidth={1.5} />
              ) : (
                <Wrench className="w-7 h-7 text-[#4BCBB4]" strokeWidth={1.5} />
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-white text-sm sm:text-base truncate group-hover:text-[#4BCBB4] transition-colors">
                {item.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase flex-shrink-0 border ${
                isProduct 
                  ? 'bg-cyan-950/80 text-[#4BCBB4] border-[#34A8A6]/40' 
                  : 'bg-teal-950/80 text-teal-300 border-teal-700/40'
              }`}>
                {item.type}
              </span>
            </div>
            
            {item.description && (
              <p className="text-xs text-[#A3D2DF] mb-2 line-clamp-1">{item.description}</p>
            )}
            
            <div className="flex items-center justify-between gap-2 mt-1">
              <p className="text-base sm:text-lg font-black text-[#4BCBB4] tracking-tight">
                R$ {(item.sale_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              
              {isProduct && item.control_stock && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  item.stock > 0 
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
                    : 'bg-rose-950/60 text-rose-300 border-rose-800/40'
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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-[#0D222E] rounded-2xl overflow-hidden shadow-sm border border-[#1C4156] hover:border-[#34A8A6]/60 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] w-full bg-[#133345] overflow-hidden">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isProduct ? (
              <Package className="w-10 h-10 text-[#4BCBB4]/60" strokeWidth={1.5} />
            ) : (
              <Wrench className="w-10 h-10 text-[#4BCBB4]/60" strokeWidth={1.5} />
            )}
          </div>
        )}
        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border backdrop-blur-md ${
          isProduct 
            ? 'bg-[#07151D]/80 text-[#4BCBB4] border-[#34A8A6]/40' 
            : 'bg-[#07151D]/80 text-teal-300 border-teal-700/40'
        }`}>
          {item.type}
        </span>
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-[#4BCBB4] transition-colors">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-[#A3D2DF] line-clamp-1 mt-0.5">{item.description}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#1C4156]/60">
          <p className="text-sm sm:text-base font-black text-[#4BCBB4] tracking-tight truncate">
            R$ {(item.sale_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          
          {isProduct && item.control_stock && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
              item.stock > 0 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
                : 'bg-rose-950/60 text-rose-300 border-rose-800/40'
            }`}>
              {item.stock || 0} un
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
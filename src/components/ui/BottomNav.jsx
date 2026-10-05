import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ShoppingBag, Package, Wallet, Calendar } from 'lucide-react';

export default function BottomNav({ currentPage }) {
  const navItems = [
    { icon: Home, label: 'Home', page: 'Dashboard' },
    { icon: ShoppingBag, label: 'Pedidos', page: 'Orders' },
    { icon: Package, label: 'Catálogo', page: 'Catalog' },
    { icon: Wallet, label: 'Financeiro', page: 'Financial' },
    { icon: Calendar, label: 'Agenda', page: 'Schedule' },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40">
      <div className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-lg shadow-black/5 border border-white/20 px-2 py-2 flex items-center justify-evenly">
        {navItems.map((item) => (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 min-w-[60px] ${
              currentPage === item.page
                ? 'bg-[#2d91a8]/10 text-[#2d91a8]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] mt-1 font-medium whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
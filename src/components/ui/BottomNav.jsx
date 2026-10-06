import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ShoppingBag, Package, Wallet, Calendar } from 'lucide-react';

export default function BottomNav({ currentPage }) {
  const navItems = [
    { icon: Home, label: 'Início', page: 'Dashboard' },
    { icon: ShoppingBag, label: 'Pedidos', page: 'Orders' },
    { icon: Package, label: 'Catálogo', page: 'Catalog' },
    { icon: Wallet, label: 'Financeiro', page: 'Financial' },
    { icon: Calendar, label: 'Agenda', page: 'Schedule' },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden pointer-events-none">
      <nav 
        aria-label="Navegação inferior mobile"
        className="pointer-events-auto bg-[#00485C] border border-[#34A8A6]/40 backdrop-blur-2xl rounded-[26px] shadow-2xl shadow-teal-950/70 px-2 py-2 flex items-center justify-evenly max-w-md mx-auto"
      >
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center py-2 px-3.5 rounded-2xl transition-all duration-300 min-w-[62px] ${
                isActive
                  ? 'bg-gradient-to-r from-[#238799] via-[#34A8A6] to-[#4BCBB4] text-gray-950 shadow-md font-bold scale-105'
                  : 'text-[#B2D8E0] hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.8} />
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-black text-gray-950' : 'font-semibold'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
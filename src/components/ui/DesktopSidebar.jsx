import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import {
  Home,
  ShoppingBag,
  Package,
  Calendar,
  Users,
  Wallet,
  Landmark,
  Boxes,
  Store,
  Sliders,
  LogOut,
  ExternalLink,
  Plus
} from 'lucide-react';

export default function DesktopSidebar({ currentPage }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navGroups = [
    {
      title: 'PRINCIPAL',
      items: [
        { label: 'Visão Geral', page: 'Dashboard', icon: Home, path: '/Dashboard' },
        { label: 'Pedidos & Vendas', page: 'Orders', icon: ShoppingBag, path: '/Orders' },
        { label: 'Catálogo de Produtos', page: 'Catalog', icon: Package, path: '/Catalog' },
        { label: 'Agenda & Atendimentos', page: 'Schedule', icon: Calendar, path: '/Schedule' },
        { label: 'Clientes (CRM)', page: 'ClientsList', icon: Users, path: '/ClientsList' },
      ],
    },
    {
      title: 'GESTÃO & ESTOQUE',
      items: [
        { label: 'Controle Financeiro', page: 'Financial', icon: Wallet, path: '/Financial' },
        { label: 'Contas & Caixas', page: 'AccountList', icon: Landmark, path: '/AccountList' },
        { label: 'Estoque & Insumos', page: 'InventoryList', icon: Boxes, path: '/InventoryList' },
      ],
    },
    {
      title: 'ONLINE & AJUSTES',
      items: [
        { label: 'Vitrine Online', page: 'Storefront', icon: Store, path: '/Storefront', external: true },
        { label: 'Personalização do App', page: 'AppCustomization', icon: Sliders, path: '/AppCustomization' },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-[#07151D] border-r border-[#1C3F54]/60 fixed inset-y-0 left-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-[#1C3F54]/40">
        <Link to="/Dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#00485C] border border-[#34A8A6]/40 p-1 flex items-center justify-center shadow-lg shadow-teal-950/40 group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="xelfy" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              xelfy
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#4BCBB4] block">
              Controle & Gestão
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Add CTA Button */}
      <div className="px-5 pt-4 pb-2">
        <Link
          to="/QuickAdd"
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-gray-950 bg-gradient-to-r from-[#238799] via-[#34A8A6] to-[#4BCBB4] hover:brightness-110 flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Novo Cadastro Rápido
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 scrollbar-thin scrollbar-thumb-[#1C3F54]">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="px-3 text-[11px] font-bold text-[#7FA6B0] uppercase tracking-wider mb-2">
              {group.title}
            </h4>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isCurrent = 
                currentPage === item.page || 
                location.pathname.toLowerCase() === item.path.toLowerCase() ||
                (item.page === 'Dashboard' && location.pathname === '/');

              return (
                <Link
                  key={item.page}
                  to={item.external ? item.path : createPageUrl(item.page)}
                  target={item.external ? '_blank' : undefined}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#00485C] to-[#0A2E3B] text-white border-l-4 border-[#4BCBB4] shadow-md shadow-teal-950/30 font-bold'
                      : 'text-[#B2D8E0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#4BCBB4]' : 'text-[#7FA6B0]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.external && (
                    <ExternalLink className="w-3 h-3 text-[#7FA6B0]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-[#1C3F54]/40 bg-[#061219]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full object-cover border border-[#34A8A6]/40 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#00485C] border border-[#34A8A6]/40 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-[10px] text-[#7FA6B0] truncate">
                {user?.email || 'Conectado'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Deseja realmente sair da sua conta?')) {
                logout();
              }
            }}
            title="Sair da Conta"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#7FA6B0] hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

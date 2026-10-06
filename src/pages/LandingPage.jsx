import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  Users, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Store,
  Sparkles,
  Zap,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-[#2d91a8] selection:text-white overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#2d91a8]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-[#52cfc1]/10 rounded-full blur-[160px]" />
      </div>

      {/* Header Navigation */}
      <header className="relative z-20 border-b border-gray-800/80 backdrop-blur-xl bg-gray-950/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2d91a8] to-[#52cfc1] flex items-center justify-center shadow-lg shadow-teal-500/20 font-bold text-gray-950 text-xl tracking-wider">
              X
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              xelfy
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/Storefront"
              className="text-xs sm:text-sm font-medium text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-850 transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-[#52cfc1]" />
              Ver Vitrine Exemplo
            </Link>
            <Link
              to="/login"
              className="text-xs sm:text-sm font-medium text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#2d91a8] to-[#52cfc1] hover:brightness-110 text-gray-950 px-4 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
            >
              Criar Conta Grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-[#52cfc1] text-xs font-medium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Sistema 100% Autônomo e Gratuito • Sem Taxas Ocultas
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]"
        >
          O controle total do seu negócio na{' '}
          <span className="bg-gradient-to-r from-[#2d91a8] via-[#52cfc1] to-teal-200 bg-clip-text text-transparent">
            palma da sua mão.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          Gestão financeira completa, pedidos, catálogo inteligente, controle de estoque e vitrine online com pedidos diretos pelo WhatsApp.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto text-base font-bold bg-gradient-to-r from-[#2d91a8] to-[#52cfc1] hover:brightness-110 text-gray-950 px-8 py-4 rounded-2xl shadow-xl shadow-teal-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            Começar Gratuitamente
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto text-base font-semibold bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-850 text-gray-200 px-6 py-4 rounded-2xl transition-all flex items-center justify-center"
          >
            Acessar Minha Conta
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#52cfc1]" />
            <span>Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#52cfc1]" />
            <span>Instalável no celular (PWA)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#52cfc1]" />
            <span>Banco de dados seguro (RLS)</span>
          </div>
        </motion.div>

        {/* Mockup Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-gray-800/60 to-gray-900/20 border border-gray-800 shadow-2xl backdrop-blur-2xl"
        >
          <div className="bg-gray-950 rounded-[22px] p-6 sm:p-8 text-left border border-gray-850">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-850 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#52cfc1] font-bold">Painel de Demonstração</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Visão Geral do Negócio</h3>
              </div>
              <Link
                to="/login"
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-teal-500/10 text-[#52cfc1] border border-teal-500/20 hover:bg-teal-500/20 transition-all flex items-center gap-1.5"
              >
                Abrir Painel Completo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
                <span className="text-xs text-gray-400">Total a Receber</span>
                <p className="text-2xl font-extrabold text-white mt-1">R$ 4.850,00</p>
                <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3.5 h-3.5" /> +18% este mês
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
                <span className="text-xs text-gray-400">Pedidos Concluídos</span>
                <p className="text-2xl font-extrabold text-white mt-1">38 pedidos</p>
                <span className="text-xs text-teal-400 flex items-center gap-1 mt-2">
                  <ShoppingBag className="w-3.5 h-3.5" /> 100% entregues
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
                <span className="text-xs text-gray-400">Saldo Consolidado</span>
                <p className="text-2xl font-extrabold text-white mt-1">R$ 12.340,50</p>
                <span className="text-xs text-blue-400 flex items-center gap-1 mt-2">
                  <BarChart3 className="w-3.5 h-3.5" /> 3 contas ativas
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-10 py-20 bg-gray-900/50 border-y border-gray-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tudo o que você precisa para crescer
            </h2>
            <p className="text-gray-400 mt-4 text-base sm:text-lg">
              Substitua dezenas de planilhas e caderninhos por uma solução unificada e moderna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-gray-950 border border-gray-800/90 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-[#52cfc1] mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Financeiro Descomplicado</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Controle receitas, despesas, contas bancárias, contas a receber e fluxo de caixa com relatórios claros.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-950 border border-gray-800/90 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-[#52cfc1] mb-6 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Vitrine Virtual & Pedidos</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Compartilhe o link da sua loja online. Clientes escolhem produtos e os pedidos chegam formatados diretamente no seu painel.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-950 border border-gray-800/90 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-[#52cfc1] mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestão de Clientes (CRM)</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Histórico de compras de cada cliente, endereço, documentos, fotos e contato rápido com 1 clique no WhatsApp.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-950 border border-gray-800/90 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-[#52cfc1] mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Agenda de Atendimentos</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Organize compromissos, prazos de entrega, reuniões e eventos para nunca mais esquecer uma entrega importante.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-950 border border-gray-800/90 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-[#52cfc1] mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instale no Celular (PWA)</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Adicione o xelfy à tela de início do seu Android ou iPhone com 1 clique e utilize como um aplicativo de verdade.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-950 border border-gray-800/90 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-[#52cfc1] mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Integração MCP para IA</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Compatível com Model Context Protocol (MCP) para conectar agentes e automatizar consultas e tarefas com inteligência artificial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-gray-850 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2d91a8] to-[#52cfc1] flex items-center justify-center font-bold text-gray-950 text-xs">
            X
          </div>
          <span className="font-semibold text-gray-300">xelfy</span>
          <span>© 2026 • Todos os direitos reservados.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/Storefront" className="hover:text-gray-300 transition-colors">Vitrine Pública</Link>
          <Link to="/login" className="hover:text-gray-300 transition-colors">Acessar Conta</Link>
          <Link to="/register" className="hover:text-gray-300 transition-colors">Cadastrar-se</Link>
        </div>
      </footer>
    </div>
  );
}

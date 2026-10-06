import React from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ message = 'Carregando dados...' }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#07151D] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-96 h-96 bg-[#00485C]/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-64 h-64 bg-[#34A8A6]/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Logo & Brand container */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo Card with glow */}
        <div className="relative">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(52, 168, 166, 0.3)',
                '0 0 45px rgba(75, 203, 180, 0.5)',
                '0 0 20px rgba(52, 168, 166, 0.3)',
              ],
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#00485C] border-2 border-[#34A8A6]/60 p-3 flex items-center justify-center shadow-2xl"
          >
            <img
              src="/logo.png"
              alt="xelfy"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </motion.div>
        </div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span className="bg-gradient-to-r from-[#238799] via-[#34A8A6] to-[#4BCBB4] bg-clip-text text-transparent">
              xelfy
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-[#8EB3BD] tracking-wider uppercase mt-1">
            Controle & Gestão Inteligente
          </p>
        </motion.div>

        {/* Loading Spinner & Status */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-3 border-[#00485C] border-t-[#4BCBB4] border-r-[#34A8A6] rounded-full animate-spin shadow-lg shadow-teal-950/40" />
          <span className="text-xs font-medium text-[#B2D8E0] tracking-wide animate-pulse">
            {message}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

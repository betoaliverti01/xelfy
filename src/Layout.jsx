import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/ui/BottomNav';
import DraggableFAB from '@/components/ui/DraggableFAB';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const pagesWithoutNav = ['ClientForm', 'OrderForm', 'CatalogForm', 'FinancialForm', 'QuickAdd', 'Receipt', 'QuotationView', 'Storefront', 'EventForm'];
  const showNav = !pagesWithoutNav.includes(currentPageName);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        base44.entities.AppSettings.filter({ created_by: user.email })
          .then(settings => {
            if (settings[0]) {
              // Apply dark mode
              if (settings[0].dark_mode) {
                setDarkMode(true);
                document.documentElement.classList.add('dark');
              }
              
              // Apply dynamic colors
              const primaryColor = settings[0].primary_color || '#2d91a8';
              const secondaryColor = settings[0].secondary_color || '#52cfc1';
              
              document.documentElement.style.setProperty('--color-primary', primaryColor);
              document.documentElement.style.setProperty('--color-secondary', secondaryColor);
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
  }, []);

  // Sync system dark mode preference on first load if no saved setting
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      // Only auto-apply if user hasn't saved an explicit preference
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-[#FAFAFA]'}`}>
      <style>{`
        :root {
          --color-primary: #2d91a8;
          --color-secondary: #52cfc1;
          --color-background: #FAFAFA;
          --color-surface: #FFFFFF;
          --color-sand: #F5F5DC;
          --color-text: #333333;
        }

        /* Dynamic color application */
        .bg-\\[\\#2d91a8\\],
        .bg-\\[var\\(--color-primary\\)\\] {
          background-color: var(--color-primary) !important;
        }

        .text-\\[\\#2d91a8\\] {
          color: var(--color-primary) !important;
        }

        .bg-\\[\\#52cfc1\\] {
          background-color: var(--color-secondary) !important;
        }

        .border-\\[\\#2d91a8\\] {
          border-color: var(--color-primary) !important;
        }

        .shadow-\\[\\#2d91a8\\]\\/20,
        .shadow-\\[\\#2d91a8\\]\\/30 {
          --tw-shadow-color: var(--color-primary);
        }

        .ring-\\[\\#2d91a8\\]\\/20 {
          --tw-ring-color: var(--color-primary);
          --tw-ring-opacity: 0.2;
        }

        .from-\\[\\#52cfc1\\]\\/20 {
          --tw-gradient-from: var(--color-secondary);
          --tw-gradient-from-opacity: 0.2;
        }

        .to-\\[\\#2d91a8\\]\\/20 {
          --tw-gradient-to: var(--color-primary);
          --tw-gradient-to-opacity: 0.2;
        }

        .from-\\[\\#2d91a8\\]\\/10 {
          --tw-gradient-from: var(--color-primary);
          --tw-gradient-from-opacity: 0.1;
        }

        .hover\\:border-\\[\\#2d91a8\\]:hover {
          border-color: var(--color-primary) !important;
        }
        
        html {
          translate: no;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .dark {
          color-scheme: dark;
          background: #111827 !important;
        }
        
        .dark * {
          border-color: #374151 !important;
        }
        
        .dark .bg-\\[\\#FAFAFA\\],
        .dark .bg-\\[\\#fafafa\\] {
          background: #111827 !important;
        }
        
        .dark .bg-white {
          background: #1f2937 !important;
        }
        
        .dark .text-\\[\\#333333\\],
        .dark .text-\\[\\#333\\] {
          color: #f3f4f6 !important;
        }
        
        .dark .text-gray-600,
        .dark .text-gray-500 {
          color: #9ca3af !important;
        }
        
        .dark .text-gray-400 {
          color: #6b7280 !important;
        }
        
        .dark .bg-gray-50,
        .dark .bg-gray-100 {
          background: #374151 !important;
        }
        
        .dark .shadow-sm,
        .dark .shadow-lg {
          box-shadow: 0 0 15px rgba(0,0,0,0.3) !important;
        }

        /* Softer shadows globally */
        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03) !important;
        }

        .shadow-lg {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
        }

        .shadow-md {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
        }
      `}</style>
      <meta name="google" content="notranslate" />
      <meta name="translate" content="no" />
      
      <main
        className={showNav ? 'pb-28' : ''}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: showNav ? 'calc(7rem + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {showNav && (
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <BottomNav currentPage={currentPageName} />
          <DraggableFAB />
        </div>
      )}
    </div>
  );
}
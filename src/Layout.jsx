import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/ui/BottomNav';
import DesktopSidebar from '@/components/ui/DesktopSidebar';
import DraggableFAB from '@/components/ui/DraggableFAB';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const pagesWithoutNav = ['ClientForm', 'OrderForm', 'CatalogForm', 'FinancialForm', 'QuickAdd', 'Receipt', 'QuotationView', 'Storefront', 'EventForm', 'LandingPage', 'Login', 'Register'];
  const showNav = !pagesWithoutNav.includes(currentPageName);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Default dark mode as requested by user
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');

    base44.auth.me()
      .then(user => {
        base44.entities.AppSettings.filter({ created_by: user.email })
          .then(settings => {
            if (settings[0]) {
              // Apply dynamic primary/secondary colors if custom, else fallback to petroleum
              const primaryColor = settings[0].primary_color || '#00485C';
              const secondaryColor = settings[0].secondary_color || '#34A8A6';
              
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

  return (
    <div className="min-h-screen dark bg-[#07151D] text-[#E5F3F7]">
      <style>{`
        :root {
          --color-primary: #00485C;
          --color-secondary: #34A8A6;
          --color-gradient-start: #238799;
          --color-gradient-mid: #34A8A6;
          --color-gradient-end: #4BCBB4;
          --color-background: #07151D;
          --color-surface: #0E2430;
          --color-border: #1C3F54;
          --color-text: #E5F3F7;
          --color-text-muted: #8EB3BD;
        }

        /* Petroleum Blue and Gradient overrides */
        .bg-petroleum {
          background-color: #00485C !important;
        }

        .bg-brand-gradient {
          background-image: linear-gradient(to right, #238799, #34A8A6, #4BCBB4) !important;
        }

        .border-petroleum {
          border-color: #1C3F54 !important;
        }

        .dark {
          color-scheme: dark;
          background-color: #07151D !important;
          color: #E5F3F7 !important;
        }

        /* Consistent Dark Petroleum surface colors for all cards & popups */
        .dark .bg-\\[\\#FAFAFA\\],
        .dark .bg-\\[\\#fafafa\\],
        .dark .bg-gray-950 {
          background-color: #07151D !important;
        }

        .dark .bg-white,
        .dark .bg-gray-900 {
          background-color: #0D222E !important;
          border-color: #1C3F54 !important;
        }

        .dark .bg-gray-50,
        .dark .bg-gray-100,
        .dark .bg-gray-800 {
          background-color: #122C3B !important;
          border-color: #1C3F54 !important;
        }

        .dark .text-\\[\\#333333\\],
        .dark .text-\\[\\#333\\],
        .dark .text-gray-900,
        .dark .text-gray-800,
        .dark .text-gray-700 {
          color: #E5F3F7 !important;
        }

        .dark .text-gray-600,
        .dark .text-gray-500 {
          color: #8EB3BD !important;
        }

        .dark .text-gray-400 {
          color: #7296A0 !important;
        }

        .dark input,
        .dark select,
        .dark textarea {
          background-color: #081924 !important;
          border-color: #1C3F54 !important;
          color: #E5F3F7 !important;
        }

        .dark input:focus,
        .dark select:focus,
        .dark textarea:focus {
          border-color: #34A8A6 !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(52, 168, 166, 0.3) !important;
        }

        /* Popups, Dialogs and Modals */
        [role="dialog"],
        .dark [role="dialog"],
        .dark [data-radix-popper-content-wrapper] > div {
          background-color: #0D222E !important;
          border-color: #1C3F54 !important;
          color: #E5F3F7 !important;
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
      `}</style>
      <meta name="google" content="notranslate" />
      <meta name="translate" content="no" />

      {/* Desktop Sidebar (Only rendered on screens lg: and when navigation is shown) */}
      {showNav && <DesktopSidebar currentPage={currentPageName} />}
      
      <main
        className={`${showNav ? 'pb-28 lg:pb-12 lg:pl-72' : ''} transition-all`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: showNav ? 'calc(6.5rem + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Mobile Bottom Navigation & Mobile Quick Add FAB */}
      {showNav && (
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <BottomNav currentPage={currentPageName} />
          <DraggableFAB />
        </div>
      )}
    </div>
  );
}
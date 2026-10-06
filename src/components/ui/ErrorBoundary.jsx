import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 shadow-xl text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Algo inesperado aconteceu
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Ocorreu uma falha ao exibir este módulo. Seus dados estão seguros e você pode tentar recarregar.
            </p>
            <div className="flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2d91a8] text-white text-xs font-semibold hover:brightness-110 transition-all shadow-sm active:scale-98"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Recarregar
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

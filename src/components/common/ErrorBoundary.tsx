import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMsg = String(error?.message || error || '');
    if (
      errorMsg.includes('isCorePipeline') ||
      errorMsg.includes('b815') ||
      errorMsg.includes('FIRESTORE INTERNAL ASSERTION FAILED')
    ) {
      console.warn('Erro Firestore ignorado:', errorMsg);
    } else {
      console.error('ErrorBoundary caught error:', error, errorInfo);
    }
  }

  public handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
              <WifiOff className="w-8 h-8 text-blue-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                TécnicaMZ Pro
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tivemos uma oscilação temporária na conexão. Os seus dados e perfil continuam protegidos e seguros.
              </p>
            </div>

            <div className="pt-2">
              <button
                id="btn-recarregar-erro"
                onClick={this.handleReload}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow transition"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


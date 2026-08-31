import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

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
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.hash = '#feed';
    }
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900">
              Ocorreu um imprevisto temporário
            </h2>
            
            <p className="text-sm text-slate-600">
              A aplicação encontrou um erro e recuperou o estado seguro. Clique no botão abaixo para restaurar a navegação.
            </p>

            {this.state.error?.message && (
              <div className="text-xs text-slate-500 bg-slate-100 p-3 rounded-lg text-left overflow-auto max-h-24">
                <code>{this.state.error.message}</code>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow transition"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar e Continuar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

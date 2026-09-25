import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    // Log to backend (non-critical)
    try {
      fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    } catch (e) {
      // Silently ignore logging errors
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-2 border-red-500/30 rounded-3xl p-8 backdrop-blur-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-3xl font-bold text-white mb-2">Oops! Something went wrong</h1>
                <p className="text-purple-300 mb-4 text-sm">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>

                {process.env.NODE_ENV === 'development' && (
                  <details className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
                    <summary className="text-xs text-purple-300 cursor-pointer font-mono">
                      Error Details (Dev Only)
                    </summary>
                    <pre className="text-xs text-gray-400 mt-2 overflow-auto">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="space-y-2">
                  <button
                    onClick={this.handleReset}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 border border-purple-500/30 font-bold rounded-lg transition-all"
                  >
                    Reload Page
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                  Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

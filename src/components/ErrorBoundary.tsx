import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-lg border border-dracula-red/30 bg-dracula-current/60 p-6 text-center">
            <p className="mb-2 font-bold text-dracula-red">Algo salio mal</p>
            <p className="mb-4 text-sm text-dracula-comment-accessible">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="rounded-lg bg-dracula-purple px-4 py-2 text-white transition-all hover:bg-dracula-purple/90"
            >
              Reintentar
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

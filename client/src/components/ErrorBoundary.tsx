import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    resetKey?: unknown;
    label?: string;
}

interface State {
    hasError: boolean;
    message?: string;
}

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: unknown): State {
        return { hasError: true, message: error instanceof Error ? error.message : String(error) };
    }

    componentDidCatch(error: unknown, info: unknown) {
        console.error('[ErrorBoundary]', error, info);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false, message: undefined });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fatal-panel" role="alert">
                    <div className="fatal-panel__card">
                        <span className="fatal-panel__kicker">{this.props.label || 'Tamil Food Thaya'}</span>
                        <h1>Something went wrong</h1>
                        <p>The page hit an unexpected error. Your data is safe — just reload and continue where you left off.</p>
                        {this.state.message && <code className="fatal-panel__detail">{this.state.message}</code>}
                        <div className="fatal-panel__actions">
                            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
                                Reload page
                            </button>
                            <a href="/" className="btn-ink">Go to home</a>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
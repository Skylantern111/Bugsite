import React from 'react';
import { RefreshCw, Skull } from 'lucide-react';

export default class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidMount() {
        window.addEventListener('error', this.handleGlobalError);
        window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    }

    componentWillUnmount() {
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
    }

    handleGlobalError = (event) => {
        this.setState({ hasError: true, error: event.error || new Error(event.message) });
    };

    handlePromiseRejection = (event) => {
        this.setState({ hasError: true, error: new Error(`Network/Async Crash: ${event.reason}`) });
    };

    componentDidCatch(error, errorInfo) {
        console.error('SYSTEM CRASH CAUGHT BY BOUNDARY:', error, errorInfo);
    }

    resetApp = () => {
        this.setState({ hasError: false, error: null });
        this.props.onReset();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
                    <div className="bg-red-950/50 border-2 border-red-500 rounded-2xl p-8 max-w-2xl w-full shadow-2xl text-center backdrop-blur-sm">
                        <Skull className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
                        <h1 className="text-3xl font-black text-red-500 mb-2 tracking-widest uppercase">
                            Fatal System Crash
                        </h1>
                        <p className="text-red-300 mb-8 font-medium">The BugSite environment has crashed.</p>
                        <div className="bg-black/80 p-4 rounded-lg text-left mb-8 overflow-auto max-h-48 border border-red-900/50">
                            <p className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </p>
                        </div>
                        <button
                            onClick={this.resetApp}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-2xl py-6 rounded-xl uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_40px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <RefreshCw className="w-8 h-8" />
                            [ RESET ENVIRONMENT ]
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

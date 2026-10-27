import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CRITICAL_SYSTEM_ERROR]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0a0806] text-[#705a42] font-mono p-8 flex flex-col justify-center items-center select-none">
          <div className="max-w-xl w-full border border-[#30271d] bg-[#120e0a] p-6 shadow-none">
            <div className="border-b border-[#30271d] pb-2 mb-4 text-[#d4bea7] text-xs tracking-widest uppercase flex items-center justify-between">
              <span>[ SYSTEM_HALT :: RUNTIME_EXCEPTION ]</span>
              <span className="text-[#a83830]">CRITICAL</span>
            </div>
            <p className="text-sm text-[#9e8264] mb-4 leading-relaxed">
              A component runtime error was caught. System execution has been safely isolated.
            </p>
            <pre className="text-xs text-[#544432] bg-[#0a0806] p-3 border border-[#30271d] overflow-x-auto mb-6 whitespace-pre-wrap">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              type="button"
              onClick={this.handleReload}
              className="border border-[#30271d] hover:border-[#705a42] bg-[#0a0806] hover:bg-[#1c1610] text-[#d4bea7] px-4 py-2 text-xs tracking-widest uppercase cursor-pointer transition-colors"
            >
              [ REBOOT PROTOCOL ]
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

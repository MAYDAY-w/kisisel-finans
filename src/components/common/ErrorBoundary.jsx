import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-6 bg-white border border-rose-100 rounded-2xl shadow-sm text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-xl mb-3">
            ⚠️
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Bu bölüm yüklenirken bir sorun oluştu
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {this.state.error?.message || 'Beklenmeyen bir hata meydana geldi.'}
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

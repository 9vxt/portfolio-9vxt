import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: '' }
  }

  static getDerivedStateFromError(error) {
    return { error: error.toString(), info: error.stack || '' }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ error: null, info: '' })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-8">
          <div className="max-w-2xl w-full" style={{ border: '1px solid #ef4444', borderRadius: 8, padding: 24, background: 'rgba(239,68,68,0.05)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#ef4444] text-lg">✖</span>
              <h2 className="text-[#ef4444] font-mono text-sm font-bold">RUNTIME ERROR</h2>
            </div>
            <pre className="text-xs font-mono text-[#f1f5f9] whitespace-pre-wrap break-all mb-4" style={{ background: '#0a0e17', padding: 16, borderRadius: 4, border: '1px solid #1e293b' }}>
              {this.state.error}
            </pre>
            <details>
              <summary className="text-xs font-mono text-[#64748b] cursor-pointer hover:text-[#94a3b8]">stack trace</summary>
              <pre className="text-[10px] font-mono text-[#475569] whitespace-pre-wrap mt-2" style={{ maxHeight: 300, overflow: 'auto' }}>
                {this.state.info}
              </pre>
            </details>
            <button onClick={this.handleRetry}
              className="mt-4 px-4 py-2 text-xs font-mono text-[#34d399] rounded"
              style={{ border: '1px solid #34d399', background: 'rgba(52,211,153,0.05)' }}>
              retry
            </button>
            <p className="text-xs font-mono text-[#64748b] mt-4">
              Check the browser console (F12 → Console) for more details.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

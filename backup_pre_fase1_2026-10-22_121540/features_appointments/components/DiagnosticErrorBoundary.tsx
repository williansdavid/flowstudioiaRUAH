import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Pares chave:valor para exibir no diagnóstico (ex: date, queryKey) */
  context?: Record<string, string>
}

interface State {
  error: Error | null
}

export class DiagnosticErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DiagnosticErrorBoundary]', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack?.split('\n').slice(0, 8).join('\n'),
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (!this.state.error) return this.props.children

    const { error } = this.state
    const errCause =
      error.cause instanceof Error
        ? `${error.cause.name}: ${error.cause.message}`
        : error.cause
          ? String(error.cause)
          : '—'

    return (
      <div className="mx-3 my-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 sm:mx-6">
        <div className="flex items-center gap-2 text-base font-bold text-amber-400">
          <span>🔍 Diagnóstico técnico</span>
        </div>

        <div className="mt-4 space-y-1.5 font-mono text-sm leading-relaxed text-slate-300">
          <div className="grid grid-cols-[120px_1fr] gap-x-2 gap-y-1.5">
            <span className="text-slate-500">Erro:</span>
            <span className="font-semibold text-red-400">{error.name}</span>

            <span className="text-slate-500">Mensagem:</span>
            <span className="break-words">{error.message}</span>

            <span className="text-slate-500">Causa:</span>
            <span className="break-words text-slate-400">{errCause}</span>

            {this.props.context &&
              Object.entries(this.props.context).map(([key, val]) => (
                <span key={key} className="contents">
                  <span className="text-slate-500">{key}:</span>
                  <span className="break-words text-cyan-300">{val}</span>
                </span>
              ))}
          </div>

          {error.stack && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-400">
                Stack trace (últimas linhas)
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950/60 p-3 text-xs text-slate-500">
                {error.stack
                  .split('\n')
                  .slice(0, 8)
                  .map((l) => l.trim())
                  .join('\n')}
                {error.stack.split('\n').length > 8 && '\n...'}
              </pre>
            </details>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-600">
          Diagnóstico temporário — o erro acima impediu o carregamento dos dados desta tela.
        </p>
      </div>
    )
  }
}
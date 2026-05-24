import { Component, type ErrorInfo, type ReactNode } from 'react'
import * as Sentry from '@sentry/react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })
  }

  handleReset = (): void => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main role="alert" className="max-w-2xl mx-auto px-4 py-16 flex flex-col gap-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          Une erreur est survenue
        </h1>
        <p className="text-muted text-sm">
          L'application a rencontré un problème inattendu. Vous pouvez réessayer ou recharger la page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={this.handleReset}
            className="hover-btn bg-primary text-white font-semibold px-6 py-3 rounded text-sm"
          >
            Réessayer
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="hover-btn bg-surface border border-black/10 text-foreground font-semibold px-6 py-3 rounded text-sm"
          >
            Recharger la page
          </button>
        </div>
      </main>
    )
  }
}

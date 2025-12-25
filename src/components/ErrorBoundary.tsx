import React, { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Something went wrong</AlertTitle>
                            <AlertDescription>
                                An unexpected error occurred. Please try refreshing the page or
                                contact support if the problem persists.
                                {process.env.NODE_ENV === 'development' && this.state.error && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm">
                                            Error details
                                        </summary>
                                        <pre className="text-xs mt-1 whitespace-pre-wrap">
                                            {this.state.error.message}
                                        </pre>
                                    </details>
                                )}
                            </AlertDescription>
                        </Alert>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={this.handleRetry} variant="outline">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getCurrentUser } from '@/lib/auth'

export const Route = createFileRoute('/login')({ component: Login })

function Login() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [error, setError] = useState<string | null>(null)

    const { data: user, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
        retry: false,
    })

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.has('verified')) {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] })
            window.history.replaceState({}, document.title, window.location.pathname)
        }
        const err = params.get('error')
        if (err) {
            setError(
                err === 'not_in_guild'
                    ? 'You are not in the required guild.'
                    : err === 'server_error'
                        ? 'Authentication failed. Please try again.'
                        : 'Authentication failed.',
            )
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [queryClient])

    useEffect(() => {
        if (!isLoading && user) {
            navigate({ to: '/' })
        }
    }, [user, isLoading, navigate])

    const handleLogin = () => {
        window.location.href = '/api/auth/discord'
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">Loading...</div>

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-zinc-100">Minstrel</CardTitle>
                    <CardDescription>Login with Discord to view your music library.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button onClick={handleLogin} className="w-full">
                        Login with Discord
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

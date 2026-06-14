import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Disc, Music, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import Ferrofluid from '@/components/FerroFluid'

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
        <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 p-4 overflow-hidden">
            <div className="absolute inset-0">
                <Ferrofluid
                    colors={['#4F46E5', '#06B6D4', '#E0F2FE']}
                    speed={0.3}
                    scale={1.8}
                    fluidity={0.15}
                    rimWidth={0.15}
                    sharpness={3}
                    shimmer={1.2}
                    glow={2.5}
                    opacity={0.6}
                />
            </div>
            <div className="relative flex flex-col items-center gap-8 w-full max-w-sm">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Minstrel</h1>
                    <p className="text-sm text-zinc-400 max-w-xs">
                        Every song shared in your Discord server, in one place.
                    </p>
                </div>

                <div className="flex gap-6 text-center">
                    <div className="space-y-1">
                        <Music className="h-5 w-5 text-indigo-400 mx-auto" />
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Auto-saved</p>
                    </div>
                    <div className="space-y-1">
                        <Disc className="h-5 w-5 text-cyan-400 mx-auto" />
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Any platform</p>
                    </div>
                    <div className="space-y-1">
                        <Users className="h-5 w-5 text-sky-400 mx-auto" />
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Shared library</p>
                    </div>
                </div>

                <Card className="w-full border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-base text-zinc-100">Welcome back</CardTitle>
                        <CardDescription>Sign in with your Discord account to continue.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button onClick={handleLogin} className="w-full gap-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                            Continue with Discord
                        </Button>
                        <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                            By continuing, you agree to let Minstrel access your<br />Discord profile and server memberships.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

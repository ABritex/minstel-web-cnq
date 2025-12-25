import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getCurrentUser } from '@/lib/auth'

export const Route = createFileRoute('/login')({ component: Login })

function Login() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  })

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('verified')) {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    const err = urlParams.get('error')
    if (err) {
      setError(
        err === 'not_in_guild'
          ? 'You are not in the required guild.'
          : 'Authentication failed.',
      )
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [queryClient])

  const handleLogin = () => {
    window.location.href = '/api/auth/discord'
  }

  if (isLoading) return <div>Loading...</div>

  if (user) {
    // Redirect to home if already logged in
    window.location.href = '/'
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login to Minstrel</CardTitle>
          <CardDescription>
            Login with Discord to verify you are in the required guild.
          </CardDescription>
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

// Server function to get current user
export async function getCurrentUser() {
    const res = await fetch('/api/auth/me')
    if (!res.ok) return null
    return res.json()
}

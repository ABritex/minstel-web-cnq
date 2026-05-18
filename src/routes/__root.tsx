import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from '../components/ErrorBoundary'

export const Route = createRootRoute({
    component: () => (
        <ErrorBoundary>
            <Outlet />
            <TanStackDevtools
                config={{ position: 'bottom-right' }}
                plugins={[
                    { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
                    { name: 'Tanstack Query', render: <ReactQueryDevtoolsPanel /> },
                ]}
            />
        </ErrorBoundary>
    ),
})

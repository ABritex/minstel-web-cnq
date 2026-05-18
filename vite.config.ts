import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        TanStackRouterVite({ target: 'react' }),
        viteTsConfigPaths({ projects: ['./tsconfig.json'] }),
        tailwindcss(),
        viteReact(),
    ],
})

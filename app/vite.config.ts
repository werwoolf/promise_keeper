import {defineConfig} from 'vite'
import {nodePolyfills} from 'vite-plugin-node-polyfills'
import tailwindcss from '@tailwindcss/vite'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [nodePolyfills(), tailwindcss()],
    server: {
        watch: {
            usePolling: true
        }
    }
})

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'

const pathResolve = (dir: string): any => {
    return resolve(__dirname, ".", dir)
}

const alias: Record<string, string> = {
    '@': pathResolve("src")
}

export default defineConfig({
    plugins: [
        vue()
    ],
    resolve: {
        alias
    },
    base: '/rubber_insurance_web/',
    build: {
        outDir: 'rubber_insurance_web'
    },
    server: {
        host: true,
        port: 8080,
        cors: true,
        proxy: {
            '/baseURL': {
                target: 'http://192.168.8.181:8098/picc_rubber/',
                // target: 'http://192.168.8.195:8098/picc_rubber/',
                // target: 'http://crm.piccyn.com:9527/picc_rubber/',
                changeOrigin: true,
                rewrite: (path) => path.replace('/baseURL', '')
            }
        }
    }
})
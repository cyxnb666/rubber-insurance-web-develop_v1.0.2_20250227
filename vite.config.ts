import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

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
    base: '/test_web/',
    build: {
        outDir: 'test_web'
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler"
            }
        }
    },
    server: {
        host: true,
        port: 8080,
        cors: true,
        proxy: {
            '/baseURL': {
                target: 'http://crm.piccyn.com:9527/picc_rubber/',
                changeOrigin: true,
                rewrite: (path) => path.replace('/baseURL', '')
            }
        }
    }
})
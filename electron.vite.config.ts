import { resolve } from "path"
import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { "@src": resolve(__dirname, "src") } }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { "@src": resolve(__dirname, "src") } }
  },
  renderer: {
    server: {
      proxy: {
        "/moddbapi": {
          target: "https://mods.vintagestory.at/api",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/moddbapi/, "")
        },
        "/moddbfiles": {
          target: "https://mods.vintagestory.at",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/moddbfiles/, "")
        }
      }
    },
    build: {
      rollupOptions: {
        external: ["*.json"]
      }
    },
    resolve: {
      alias: {
        "@renderer": resolve(__dirname, "src/renderer/src")
      }
    },
    plugins: [react()]
  }
})

import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, loadEnv } from 'vite'


export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log("env", env)
  
  return {
    base: "",
    define: {
      'process.env.ALPINE_GATEWAY_URL': JSON.stringify(env.ALPINE_GATEWAY_URL)
    },
    plugins: [
      react(),
    ],
    server: {
      open: false,
      port: 3000,
    },
    build: {
      outDir: "build",
    },
    resolve: {
      preserveSymlinks: false,
    },
  }
})

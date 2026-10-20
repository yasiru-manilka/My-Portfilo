import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  const xampp = env.VITE_XAMPP_URL || "http://localhost/portfolio";

  return {
    base: "./",
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL("./index.html", import.meta.url)),
          admin: fileURLToPath(new URL("./admin/index.html", import.meta.url))
        }
      }
    },
    server: {
      proxy: {
        "/server": { target: xampp, changeOrigin: true },
        "/uploads": { target: xampp, changeOrigin: true }
      }
    }
  };
});

import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip type checking warnings during build
        if (warning.code === 'TYPESCRIPT_ERROR') return;
        warn(warning);
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-checkbox'],
          utils: ['lucide-react', 'zustand', 'react-hook-form', 'zod']
        }
      }
    }
  },
  esbuild: {
    // Disable type checking in esbuild
    logLevel: 'error'
  }
});

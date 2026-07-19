// vite.config.ts
import { defineConfig } from "file:///D:/my_build_software/pulse-ai/apps/desktop/node_modules/vite/dist/node/index.js";
import path from "node:path";
import electron from "file:///D:/my_build_software/pulse-ai/apps/desktop/node_modules/vite-plugin-electron/dist/simple.mjs";
import react from "file:///D:/my_build_software/pulse-ai/apps/desktop/node_modules/@vitejs/plugin-react/dist/index.js";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "file:///D:/my_build_software/pulse-ai/apps/desktop/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\my_build_software\\pulse-ai\\apps\\desktop";
var __vite_injected_original_import_meta_url = "file:///D:/my_build_software/pulse-ai/apps/desktop/vite.config.ts";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: "electron/main.ts"
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__vite_injected_original_dirname, "electron/preload.ts")
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: process.env.NODE_ENV === "test" ? void 0 : {}
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxteV9idWlsZF9zb2Z0d2FyZVxcXFxwdWxzZS1haVxcXFxhcHBzXFxcXGRlc2t0b3BcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXG15X2J1aWxkX3NvZnR3YXJlXFxcXHB1bHNlLWFpXFxcXGFwcHNcXFxcZGVza3RvcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovbXlfYnVpbGRfc29mdHdhcmUvcHVsc2UtYWkvYXBwcy9kZXNrdG9wL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcbmltcG9ydCBlbGVjdHJvbiBmcm9tICd2aXRlLXBsdWdpbi1lbGVjdHJvbi9zaW1wbGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tIFwibm9kZTp1cmxcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgdGFpbHdpbmRjc3MoKSxcbiAgICBlbGVjdHJvbih7XG4gICAgICBtYWluOiB7XG4gICAgICAgIC8vIFNob3J0Y3V0IG9mIGBidWlsZC5saWIuZW50cnlgLlxuICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL21haW4udHMnLFxuICAgICAgfSxcbiAgICAgIHByZWxvYWQ6IHtcbiAgICAgICAgLy8gU2hvcnRjdXQgb2YgYGJ1aWxkLnJvbGx1cE9wdGlvbnMuaW5wdXRgLlxuICAgICAgICAvLyBQcmVsb2FkIHNjcmlwdHMgbWF5IGNvbnRhaW4gV2ViIGFzc2V0cywgc28gdXNlIHRoZSBgYnVpbGQucm9sbHVwT3B0aW9ucy5pbnB1dGAgaW5zdGVhZCBgYnVpbGQubGliLmVudHJ5YC5cbiAgICAgICAgaW5wdXQ6IHBhdGguam9pbihfX2Rpcm5hbWUsICdlbGVjdHJvbi9wcmVsb2FkLnRzJyksXG4gICAgICB9LFxuICAgICAgLy8gUGxveWZpbGwgdGhlIEVsZWN0cm9uIGFuZCBOb2RlLmpzIEFQSSBmb3IgUmVuZGVyZXIgcHJvY2Vzcy5cbiAgICAgIC8vIElmIHlvdSB3YW50IHVzZSBOb2RlLmpzIGluIFJlbmRlcmVyIHByb2Nlc3MsIHRoZSBgbm9kZUludGVncmF0aW9uYCBuZWVkcyB0byBiZSBlbmFibGVkIGluIHRoZSBNYWluIHByb2Nlc3MuXG4gICAgICAvLyBTZWUgXHVEODNEXHVEQzQ5IGh0dHBzOi8vZ2l0aHViLmNvbS9lbGVjdHJvbi12aXRlL3ZpdGUtcGx1Z2luLWVsZWN0cm9uLXJlbmRlcmVyXG4gICAgICByZW5kZXJlcjogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0J1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZWxlY3Ryb24tdml0ZS92aXRlLXBsdWdpbi1lbGVjdHJvbi1yZW5kZXJlci9pc3N1ZXMvNzgjaXNzdWVjb21tZW50LTIwNTM2MDA4MDhcbiAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgOiB7fSxcbiAgICB9KSxcbiAgXSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBULFNBQVMsb0JBQW9CO0FBQ3ZWLE9BQU8sVUFBVTtBQUNqQixPQUFPLGNBQWM7QUFDckIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZSxXQUFXO0FBQ25DLE9BQU8saUJBQWlCO0FBTHhCLElBQU0sbUNBQW1DO0FBQTRKLElBQU0sMkNBQTJDO0FBUXRQLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUE7QUFBQSxRQUVKLE9BQU87QUFBQSxNQUNUO0FBQUEsTUFDQSxTQUFTO0FBQUE7QUFBQTtBQUFBLFFBR1AsT0FBTyxLQUFLLEtBQUssa0NBQVcscUJBQXFCO0FBQUEsTUFDbkQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlBLFVBQVUsUUFBUSxJQUFJLGFBQWEsU0FFL0IsU0FDQSxDQUFDO0FBQUEsSUFDUCxDQUFDO0FBQUEsRUFDSDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==

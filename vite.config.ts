import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Served from https://xudaniel.github.io/mingli-fengshui/
  base: "/mingli-fengshui/",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        id: "/mingli-fengshui/",
        name: "命理风水 · 八字四柱排盘",
        short_name: "命理风水",
        description: "依据出生地与出生年月日时，在浏览器本地排出四柱八字、五行喜忌与八宅风水方位",
        start_url: "/mingli-fengshui/",
        scope: "/mingli-fengshui/",
        display: "standalone",
        background_color: "#100e13",
        theme_color: "#100e13",
        lang: "zh-CN",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Nominatim place search is the only network call; everything else
        // (fonts aside) should work fully offline once installed.
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});

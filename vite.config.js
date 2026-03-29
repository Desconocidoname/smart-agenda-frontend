import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Syncro Agenda',
        short_name: 'Syncro',
        description: 'Tu agenda inteligente offline',
        theme_color: '#00796B',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            // Icono de tuerca temporal desde internet para que funcione la instalación
            src: '/icon.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
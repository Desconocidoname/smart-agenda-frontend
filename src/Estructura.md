src/
  ├── assets/       # Imágenes, iconos, tu logo y el manifest de la PWA.
  ├── components/   # UI "tonta" y reutilizable (Botones genéricos, Inputs de Material Design).
  ├── features/     # l corazón de la app (auth, tasks, sync).
  ├── hooks/        # Lógica reutilizable de React (ej. useNetwork para ver si hay WiFi).
  ├── pages/        # Las vistas completas de las pantallas (Login, Home).
  ├── services/     # Todo lo que se comunica con el exterior (Llamadas a tu API en Go, IndexedDB).
  ├── App.jsx       # El enrutador principal que decide qué página mostrar.
  └── main.jsx      # El punto de arranque.
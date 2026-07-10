# Estancia · PMS — Panel Admin

Panel de administración para un sistema de reservaciones hoteleras, implementado a partir de un diseño de Claude Design.

**Stack:** React 19 + Vite 8. Datos mock, persistencia en `localStorage`.

## Vistas

- **Panel** — KPIs de ocupación, llegadas y salidas del día, ingresos del mes.
- **Reservaciones** — Mapa de ocupación por edificio con selección de fecha, o vista cronograma mensual con barras por reserva.
- **Habitaciones** — Tarjetas por tipo de habitación con drag-drop de fotos, switch activa/oculta y modal de edición con comodidades.
- **Paquetes** — Extras que se ofrecen al huésped (desayuno, spa, cena, salida tardía).
- **Check-in y tarjetas** — Lista de llegadas y huéspedes en casa, detalle de reserva y flujo simulado de codificación de tarjeta NFC (buscando → acerca tarjeta → escribiendo → activada).
- **Configuración** — Marca del hotel (nombre, lema, logo, color de acento) con vista previa de la app del huésped, y editor de estructura (por edificios o lista única).

El color de acento se propaga con la variable CSS `--ac` desde el root del grid.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

## Estructura

```
src/
├── App.jsx                     # orquesta tabs, persistencia y modales
├── data/mockData.js            # habitaciones, paquetes, reservaciones, estructura, swatches
├── hooks/usePersistentState.js # useState + localStorage
├── utils/helpers.js            # fmt, initials, roomsOf, STATE_COLORS, fmtAbs
├── components/
│   ├── Sidebar.jsx
│   ├── ImageSlot.jsx           # drag-drop de imágenes con persistencia
│   ├── RoomPackageModal.jsx
│   └── CardModal.jsx           # flujo NFC de 4 fases
└── views/
    ├── Dashboard.jsx
    ├── Reservaciones.jsx
    ├── Habitaciones.jsx
    ├── Paquetes.jsx
    ├── CheckIn.jsx
    └── Configuracion.jsx
```

Toda la persistencia usa claves `estancia-*` en `localStorage` (habitaciones, paquetes, configuración, estructura y fotos de cada slot).

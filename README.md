# Estancia · PMS

Sistema de reservaciones para hotel boutique con dos frentes en la misma app: **Panel Admin** para recepción y **App del Huésped** para reservar. Implementado a partir de un diseño de Claude Design.

**Stack:** React 19 + Vite 8. Datos mock, persistencia en `localStorage`.

## Rutas

- **`/`** — Panel del hotel (uso interno).
- **`/#huesped`** — App del huésped (formato móvil, dentro de un marco tipo iPhone).

Desde el sidebar del admin hay un botón "Ver app del huésped" que salta a `#huesped`; en la app del huésped, el footer tiene "Panel del hotel →" que regresa. Ambas apps leen la misma configuración (nombre, lema, color) de `localStorage`, así que un cambio en el admin se refleja al recargar la app del huésped.

## Panel Admin

- **Panel** — KPIs de ocupación, llegadas y salidas del día, ingresos del mes.
- **Reservaciones** — Mapa de ocupación por edificio con selección de fecha, o vista cronograma mensual con barras por reserva.
- **Habitaciones** — Tarjetas por tipo de habitación con drag-drop de fotos, switch activa/oculta y modal de edición con comodidades.
- **Paquetes** — Extras que se ofrecen al huésped (desayuno, spa, cena, salida tardía).
- **Check-in y tarjetas** — Lista de llegadas y huéspedes en casa, detalle de reserva y flujo simulado de codificación de tarjeta NFC (buscando → acerca tarjeta → escribiendo → activada).
- **Configuración** — Marca del hotel (nombre, lema, logo, color de acento) con vista previa de la app del huésped, y editor de estructura (por edificios o lista única).

## App del Huésped

- **Home** — Hero con foto del hotel, buscador (llegada, salida, huéspedes), features del hotel y carrusel de reseñas.
- **Habitaciones** — Lista filtrable (Todas, Para dos, Familiares, Terraza y alberca).
- **Detalle** — Carrusel de fotos, descripción larga, comodidades y CTA para armar la reserva.
- **Paquetes** — Selección con checkboxes y desglose de precio en tiempo real (precio × noches × huéspedes según la unidad de cada paquete).
- **Confirmación** — Check animado, código de reserva generado, resumen y aviso de que la tarjeta-llave se activa en recepción.

El color de acento se propaga con la variable CSS `--ac` desde el root de cada app.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

## Estructura

```
src/
├── App.jsx                     # router hash: admin ↔ huésped, orquesta el admin
├── data/mockData.js            # habitaciones, paquetes, reservaciones, estructura, swatches, reseñas
├── hooks/usePersistentState.js # useState + localStorage
├── utils/helpers.js            # fmt, initials, roomsOf, STATE_COLORS, fmtAbs
├── components/
│   ├── Sidebar.jsx
│   ├── ImageSlot.jsx           # drag-drop de imágenes con persistencia
│   ├── RoomPackageModal.jsx
│   └── CardModal.jsx           # flujo NFC de 4 fases
├── views/                      # vistas del admin
│   ├── Dashboard.jsx
│   ├── Reservaciones.jsx
│   ├── Habitaciones.jsx
│   ├── Paquetes.jsx
│   ├── CheckIn.jsx
│   └── Configuracion.jsx
└── guest/
    └── GuestApp.jsx            # 5 pantallas del huésped dentro de un frame de iPhone
```

Toda la persistencia usa claves `estancia-*` en `localStorage` (habitaciones, paquetes, configuración, estructura y fotos de cada slot).

# 🌮 Tacos El Compache de Ah Mun

Aplicación web **mobile-first** para una taquería mexicana tradicional especializada en
**tacos de guisos**. Permite ver el menú, conocer la historia, encontrar la ubicación, armar
un carrito, pagar con **Mercado Pago** y recibir confirmación — todo en menos de 2 minutos.

> _"El sabor de casa, más cerca."_

## ✨ Características

- **Menú** dinámico (Supabase) con respaldo estático: 15 guisos + aguas y refrescos.
- **Carrito** persistente (localStorage) con cantidades, subtotal y total.
- **Checkout** con datos de contacto, notas y método de entrega (recoger / domicilio).
- **Mercado Pago Checkout Pro** con `success` / `pending` / `failure` y webhook.
- **Modo demo**: funciona sin llaves — menú estático y pago simulado.
- **Páginas** ¿Quiénes Somos? y Ubicación (mapa, "Cómo llegar", WhatsApp, horario).
- **Panel de pedidos** (`/admin/pedidos`) con login y cambio de estado por pedido.
- Estética cálida y auténticamente mexicana basada en el Brand ID.

## 🧰 Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand ·
Supabase (PostgreSQL) · Mercado Pago · Vercel.

## 🚀 Puesta en marcha

```bash
npm install
cp .env.example .env.local   # opcional: la app corre en modo demo sin llaves
npm run dev                  # http://localhost:3000
```

Sin configurar nada, la app arranca en **modo demo**: el menú viene de
`src/data/menu.ts` y el pago se simula (te lleva directo a la pantalla de confirmación).

## 🗄️ Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta en orden:
   - `supabase/migrations/0001_init.sql`
   - `supabase/seed.sql`
   (o con la CLI: `supabase db push` y luego corre el seed).
3. Copia en `.env.local` la URL, la `anon key` y la `service_role key`
   (Project Settings → API).

Tablas: `categories`, `products`, `customers`, `orders`, `order_items`, `payments`.
Precios almacenados en **centavos**. RLS activo: lectura pública del menú; escrituras solo
con `service_role` desde el servidor.

## 💳 Mercado Pago

1. Obtén tus credenciales (sandbox o producción) en el
   [panel de desarrolladores](https://www.mercadopago.com.mx/developers).
2. Coloca `MP_ACCESS_TOKEN` (y `NEXT_PUBLIC_MP_PUBLIC_KEY`) en `.env.local`.
3. Define `NEXT_PUBLIC_SITE_URL` con tu dominio público (para `back_urls` y el webhook).
4. El webhook vive en `POST /api/webhooks/mercadopago` — regístralo en tu cuenta de MP.

Flujo: el cliente confirma → `POST /api/checkout` verifica precios contra la BD, crea la
orden (`pendiente`) y genera la preferencia → redirección a Mercado Pago → el webhook
actualiza el estado (`pagado` / `pendiente` / `cancelado`).

## 🔐 Panel de administración

Visita `/admin/pedidos`. Define `ADMIN_PASSWORD` en `.env.local` para exigir login
(si lo dejas vacío, el panel queda **abierto** — solo para desarrollo, con aviso visible).
Una vez con Supabase configurado, podrás ver los pedidos por estado
(recibido / pendiente / pagado / cancelado) y **cambiar su estado** desde cada tarjeta.

## 📁 Estructura

```
src/
├── app/                    # rutas (App Router)
│   ├── page.tsx            # Home
│   ├── menu/ nosotros/ ubicacion/ carrito/ checkout/
│   ├── admin/pedidos/      # panel de pedidos
│   └── api/checkout · api/webhooks/mercadopago
├── components/             # layout · menu · cart · ui · brand
├── lib/                    # menu · orders · mercadopago · cart-store · format · supabase
├── config/business.ts      # ← EDITA aquí dirección, teléfono, horario, etc.
├── data/menu.ts            # menú estático de respaldo
└── types/                  # tipos compartidos
supabase/                   # migrations + seed
```

## ⚙️ Personalización rápida

- **Datos del negocio**: `src/config/business.ts` (dirección, teléfono, WhatsApp, horario, envío).
- **Menú / precios**: en Supabase (`products`) o en `src/data/menu.ts` para el modo demo.
- **Imágenes**: `public/menu/<slug>.jpg` (ver `public/menu/README.md`).
- **Colores y tipografía**: tokens de marca en `src/app/globals.css`.

## ☁️ Deploy en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel.
2. Agrega las variables de entorno del `.env.example`.
3. Deploy. Actualiza `NEXT_PUBLIC_SITE_URL` con el dominio final.

## 📜 Scripts

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run start    # servir build
npm run lint     # linter
```

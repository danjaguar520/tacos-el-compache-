# 🚀 Deploy a Vercel — Tacos El Compache de Ah Mun

Guía paso a paso para publicar la app. El repo ya tiene un commit inicial en la rama `main`.

## 1. Sube el código a GitHub

Crea un repositorio vacío en [github.com/new](https://github.com/new) (por ejemplo
`tacos-el-compache`, sin README ni .gitignore) y luego, desde la terminal del proyecto:

```bash
git remote add origin https://github.com/TU_USUARIO/tacos-el-compache.git
git push -u origin main
```

> `.env.local` **no** se sube (está en `.gitignore`). Solo se versiona `.env.example`.

## 2. Importa en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new) e inicia sesión con GitHub.
2. **Import** el repositorio `tacos-el-compache`.
3. Framework: **Next.js** (autodetectado). No cambies build settings.
4. **Antes de hacer Deploy**, agrega las variables de entorno (paso 3).

## 3. Variables de entorno en Vercel

En la pantalla de import → **Environment Variables**, agrega (copia los valores de tu
`.env.local`):

| Variable | ¿Secreta? | Notas |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | No | Pon tu dominio de Vercel, p. ej. `https://tacos-el-compache.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | No | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sí** | service_role (omite RLS) |
| `MP_ACCESS_TOKEN` | **Sí** | Token de Mercado Pago |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | No | Public key de MP |
| `ADMIN_PASSWORD` | **Sí** | Acceso al panel `/admin/pedidos` |

Haz **Deploy**.

## 4. Ajusta la URL pública y redeploy

1. Cuando termine el primer deploy, copia el dominio real (p. ej. `https://tacos-el-compache.vercel.app`).
2. Si difiere del valor que pusiste, actualiza `NEXT_PUBLIC_SITE_URL` en
   **Project → Settings → Environment Variables** con ese dominio.
3. **Redeploy** (Deployments → ⋯ → Redeploy) para que tome el cambio.

> Con una URL pública (no localhost), `auto_return` y el `notification_url` de
> Mercado Pago se activan automáticamente (el código lo detecta solo).

## 5. Registra el webhook de Mercado Pago

En tu aplicación de Mercado Pago → **Webhooks / Notificaciones**, agrega la URL:

```
https://TU_DOMINIO.vercel.app/api/webhooks/mercadopago
```

Evento: **Pagos** (`payment`). Así, al completarse un pago, el pedido pasa de
`pendiente` a `pagado` automáticamente.

## 6. Pasar a producción (cuando estés listo para cobrar de verdad)

- En Mercado Pago, cambia las **credenciales de prueba** por las de **producción**
  (`MP_ACCESS_TOKEN` y `NEXT_PUBLIC_MP_PUBLIC_KEY`) en Vercel y redeploy.
- Las credenciales de prueba solo procesan pagos de prueba.

## Checklist final

- [ ] Repo en GitHub
- [ ] Importado en Vercel con las 7 variables de entorno
- [ ] `NEXT_PUBLIC_SITE_URL` = dominio real + redeploy
- [ ] Webhook de MP registrado
- [ ] Menú carga desde Supabase en el dominio público
- [ ] Pedido de prueba completa el flujo y llega a `/admin/pedidos`
- [ ] (Producción) credenciales MP de producción

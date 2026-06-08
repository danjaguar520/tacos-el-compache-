# 6D-C.1 — Lok'al Business Factory: arquitectura, auditoría y seguridad

> **Estado del documento:** BORRADOR para revisión (snapshot 5D-STABLE.1, 2026-06-08).
> No commiteado. Refleja el estado del Factory inmediatamente después del commit
> `bc45b53` ("feat(factory): add Lok'al Business Factory wizard with access control").

## 1. Resumen ejecutivo

El **Lok'al Business Factory** es la herramienta de aprovisionamiento de nuevos
negocios para la plataforma Lok'al: un asistente ("wizard") que captura la identidad,
catálogo, horario, branding e historia de un negocio y produce a partir de ello el
contenido y configuración necesarios para publicarlo.

Existe en dos formas — un **CLI** (`scripts/create-business/`, basado en `tsx`) y una
**aplicación web** integrada al proyecto (`src/app/(factory)/`, `src/lib/factory/`).
Ambas comparten el mismo modelo de datos (tipos espejados, ver §13).

Durante el sprint **6D-C.1** se realizó una auditoría de seguridad del panel web del
Factory — expuesto en `/factory` sin ningún control de acceso — y se implementó una
capa de autenticación dedicada (`factory-auth.ts`), replicando el patrón ya probado en
`admin-auth.ts` pero con credencial propia (`FACTORY_ACCESS_PASSWORD`), bajo el
principio de menor privilegio. El sprint cierra con el panel y sus rutas API
protegidas, validado en vivo (suites de 12 pruebas por sub-fase, sin hallazgos), y con
una decisión estratégica oficial documentada: la plataforma compartida multi-tenant es
el modelo principal de publicación; la exportación a ZIP queda como modo legado/opcional.

## 2. Arquitectura actual del Factory

```
scripts/create-business/        ← CLI (tsx) — copia espejo, imports relativos
  ├── types.ts                  ← réplica de src/lib/factory/types.ts
  └── ... (generadores, prompts, etc.)

src/app/(factory)/factory/      ← Wizard web (App Router)
  ├── page.tsx                  ← panel principal (protegido, guard inline)
  ├── login/page.tsx            ← login (NO protegido — fuera del guard)
  ├── crear/
  │   ├── layout.tsx            ← guard de servidor (envuelve solo /factory/crear)
  │   └── page.tsx              ← formulario del wizard ("use client")
  ├── preview/
  │   ├── layout.tsx            ← guard de servidor (envuelve solo /factory/preview)
  │   └── page.tsx              ← previsualización + exportación ("use client")
  └── actions.ts                ← server actions: factoryLogin / factoryLogout

src/app/api/factory/
  ├── generate/route.ts         ← genera contenido (protegido — guard 401)
  └── download/route.ts         ← genera ZIP de exportación (protegido — guard 401)

src/components/factory/
  ├── FactoryLoginForm.tsx
  ├── FactoryLogoutButton.tsx
  └── preview/ (ThemeWrapper, BusinessCard, PreviewHome, PreviewNosotros, PreviewMenu)

src/lib/
  ├── factory-auth.ts           ← librería de autenticación HMAC (fuente canónica)
  ├── factory-store.ts          ← estado del wizard (zustand + persist)
  └── factory/
      ├── types.ts              ← FUENTE CANÓNICA de tipos
      ├── json-types.ts         ← tipos JSON serializables (BusinessConfig/ThemeConfig/FactoryDraft)
      └── ai/types.ts           ← tipos de generación asistida por IA (BusinessDNA, GeneratedContent)
```

## 3. Flujo completo del Factory

1. El operador navega a `/factory` → si `FACTORY_ACCESS_PASSWORD` está configurada y
   no hay sesión válida, es redirigido a `/factory/login`.
2. Tras autenticarse (`factoryLogin` server action → cookie HMAC `factory_admin`),
   accede al panel (`/factory`), donde puede iniciar un nuevo alta.
3. `/factory/crear` — wizard de 8 pasos (`identidad`, `contacto`, `ubicacion`,
   `horario`, `catalogo`, `historia`, `branding`, `resumen`); el estado se acumula en
   `useFactoryStore` (persistido en `localStorage`, expira a las 24h).
4. Al completar el wizard, `/api/factory/generate` produce el contenido (asistido por
   IA o por plantilla — bandera `fromAI`).
5. `/factory/preview` muestra el resultado en pestañas (Identidad / Home / Nosotros /
   Menú) usando los mismos componentes de presentación que el sitio final
   (`ThemeWrapper`, `BusinessCard`, etc.).
6. Desde la previsualización, el operador puede:
   - **Regenerar** contenido (vuelve al paso 7 del wizard), o
   - **Exportar configuración** vía `/api/factory/download` → produce un `.zip` con
     los archivos generados (modo **legado/opcional**, ver §11), o
   - (futuro, 6D-C.2) **Publicar directamente** en la plataforma compartida — bloque
     señalado en la UI como "llega en 6D-C.2".
7. `factoryLogout` cierra la sesión y limpia la cookie.

## 4. Componentes principales

| Componente / módulo | Rol |
|---|---|
| `factory-auth.ts` | Librería de autenticación HMAC dedicada al Factory (mirror de `admin-auth.ts`) |
| `factory/page.tsx` | Panel principal — guard inline (server component async) |
| `factory/login/page.tsx` + `FactoryLoginForm.tsx` | Pantalla y formulario de login — **fuera** del guard |
| `factory/crear/layout.tsx`, `factory/preview/layout.tsx` | Layouts de servidor que aplican el guard a segmentos cuyas páginas son `"use client"` |
| `factory/actions.ts` | Server actions `factoryLogin`/`factoryLogout` |
| `FactoryLogoutButton.tsx` | Botón de cierre de sesión, renderizado condicionalmente en el panel |
| `factory-store.ts` | Estado global del wizard (zustand + persist, localStorage `lokal-factory-draft`) |
| `api/factory/generate`, `api/factory/download` | Rutas API protegidas con guard 401 |
| `factory/types.ts` (canónico) / `scripts/create-business/types.ts` (espejo) | Contratos de tipos compartidos entre CLI y wizard web |
| `factory/json-types.ts` | Tipos JSON serializables — destino: columnas `businesses.config`/`.theme`/`.dna` |

## 5. Hallazgos de auditoría

La auditoría previa a 6D-C.1 (fases de diseño 6D-C.1 / 6D-C.1-PRECHECK / 6D-C.1-FINAL
/ 6D-C.1-FINAL-B) identificó:

1. **El panel `/factory` y sus rutas API estaban completamente expuestos** — sin
   autenticación ni autorización de ningún tipo, accesibles por cualquiera que
   conociera la URL.
2. **`tsx` no resuelve alias `@/`** — confirmado leyendo `package.json`, `tsconfig.json`
   y `next.config.ts`, y corroborado por el hecho de que las 26 declaraciones `import`
   existentes en `scripts/create-business/` usan deliberadamente rutas relativas con
   sufijo `.js`. Esto descartó la opción de unificar imports vía alias como solución
   simple a la duplicación de tipos (§13).
3. **Riesgo de loop de redirección en el diseño inicial** — la primera propuesta de
   diseño protegía `(factory)/layout.tsx` globalmente, lo cual habría envuelto también
   `/factory/login`, generando un ciclo de redirección. Detectado y corregido por
   decisión explícita del autor antes de implementar.
4. **Incompatibilidad servidor/cliente en el guard** — `crear/page.tsx` y
   `preview/page.tsx` son componentes `"use client"`, que no pueden invocar funciones
   de autenticación dependientes de `cookies()` (server-only) directamente. Resuelto
   mediante layouts de servidor anidados, acotados únicamente a su propio segmento de
   ruta.

## 6. Riesgos identificados

- **R1 — Acceso no autenticado al panel completo del Factory**: cualquier visitante
  podía iniciar, generar y descargar configuraciones de negocio sin credenciales.
- **R2 — Acceso no autenticado a las rutas API de generación/descarga**: incluso con
  el panel protegido, `/api/factory/generate` y `/api/factory/download` eran
  invocables directamente sin pasar por la UI.
- **R3 — Riesgo estructural de loop de redirección** si se optaba por proteger el
  layout global en lugar de páginas individuales (riesgo de diseño, no de producción
  — detectado y evitado antes de implementar).
- **R4 — Confusión de modelo de publicación**: la UI sugería el ZIP como ruta
  principal de publicación, en desalineación con la decisión estratégica de adoptar la
  plataforma compartida como modelo principal (§11).

## 7. Riesgos eliminados en 6D-C.1

| Riesgo | Cómo se eliminó | Evidencia de validación |
|---|---|---|
| R1 | Guard de autenticación en `factory/page.tsx` (inline, server component async) + layouts de guard en `crear/` y `preview/` | 12 pruebas en vivo por sub-fase (curl con tokens HMAC calculados), repetidas en 6D-C.1A, 6D-C.1B y 6D-C.1C — todas PASS |
| R2 | Guard 401 (`if (isFactoryConfigured() && !(await isFactoryAuthenticated()))`) al inicio de cada handler en `generate/route.ts` y `download/route.ts` | Mismas suites de validación; respuestas 401 confirmadas sin sesión válida |
| R3 | Decisión de diseño: NO proteger `(factory)/layout.tsx` global; proteger individualmente `factory/page.tsx`, y mediante layouts anidados scoped `crear/` y `preview/`; `login/page.tsx` queda estructuralmente fuera de cualquier guard | Verificado estructuralmente (topología de segmentos del App Router garantiza que un layout de un segmento hijo no envuelve a sus hermanos) y empíricamente (cero loops observados en las 36 pruebas acumuladas) |
| R4 | Recopiado de la UI de previsualización: botón ZIP renombrado a "Exportar configuración (modo legacy)"; bloque de "Publicar en Lok'al" reescrito para señalar la plataforma compartida (6D-C.2) como ruta principal y el ZIP como exportación manual opcional; comentarios canónicos añadidos a `json-types.ts`, `factory/types.ts` y `scripts/create-business/types.ts` | Revisión de código (6D-C.1C), aprobada por el autor |

## 8. Seguridad implementada

Librería **`factory-auth.ts`** (`src/lib/factory-auth.ts`), mirror funcional de
`admin-auth.ts` con credencial propia y dedicada:

- **Credencial:** `FACTORY_ACCESS_PASSWORD` (variable de entorno independiente de
  `ADMIN_ACCESS_PASSWORD` — principio de menor privilegio; documentada en `.env.example`).
- **Modo abierto/demo:** si la variable no está configurada (o tiene el prefijo
  placeholder `__`), `isFactoryConfigured()` devuelve `false` y el Factory opera sin
  guard — mismo comportamiento que `admin-auth.ts` para entornos de desarrollo.
- **Sesión:** cookie `factory_admin`, token HMAC-SHA256
  (`createHmac("sha256", pw).update("factory-admin-v1").digest("hex")`),
  `httpOnly`, `sameSite: "lax"`, `secure` en producción, `maxAge` de 8 horas
  (`SESSION_MAX_AGE = 60 * 60 * 8`).
- **API pública de la librería:** `isFactoryConfigured()`, `verifyFactoryPassword()`,
  `factorySessionToken()`, `isValidFactoryToken()`, `isFactoryAuthenticated()`,
  `setFactorySessionCookie()`, `clearFactorySessionCookie()`.
- **Server actions:** `factoryLogin`/`factoryLogout` en `factory/actions.ts`,
  estructuralmente idénticas a las de `admin/actions.ts`.

## 9. Protección de `/factory`

- **`factory/page.tsx`**: convertido a server component `async`; guard inline al
  inicio del render — si `isFactoryConfigured() && !(await isFactoryAuthenticated())`,
  redirige a `/factory/login`. Incluye `<FactoryLogoutButton />` renderizado
  condicionalmente en `absolute right-4 top-4` (contenedor `<main>` ajustado a
  `relative`).
- **`factory/login/page.tsx`**: deliberadamente **fuera** de cualquier guard —
  garantía estructural de que no puede formar parte de un ciclo de redirección.
- **`factory/crear/`** y **`factory/preview/`**: cada uno recibe su propio
  `layout.tsx` de servidor (`async function FactoryCrearLayout` /
  `FactoryPreviewLayout`), que aplica el mismo guard antes de renderizar `children`.
  Esta solución fue necesaria porque las páginas de ambos segmentos son `"use client"`
  y no pueden invocar `cookies()`/funciones server-only directamente — el layout de
  servidor actúa como frontera de autorización antes de entregar el control al árbol
  de cliente.
- **Garantía estructural anti-loop**: en el App Router de Next.js, el `layout.tsx` de
  un segmento envuelve únicamente ese segmento y sus descendientes — nunca a sus
  hermanos. Como `login/` es hermano de `crear/`/`preview/`/la página raíz de
  `factory/`, es estructuralmente imposible que el guard de cualquiera de ellos
  redirija de vuelta hacia sí mismo a través de `/factory/login`.

## 10. Protección de `/api/factory/*`

- **`api/factory/generate/route.ts`** y **`api/factory/download/route.ts`**: guard al
  inicio de cada `try`:
  ```ts
  if (isFactoryConfigured() && !(await isFactoryAuthenticated())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  ```
  Esto cierra el vector de invocación directa (sin pasar por la UI protegida),
  devolviendo `401` de forma consistente con el resto de la aplicación.

## 11. Decisión estratégica oficial

> **MODELO PRINCIPAL: PLATAFORMA COMPARTIDA MULTI-TENANT.**
> El flujo principal de alta de negocios será el alta directa a
> `businesses.config`/`.theme`/`.dna` dentro de la plataforma compartida (bloque
> **6D-C.2**), aprovechando el modelo multi-tenant consolidado en el bloque 5D
> (ver `docs/5D-CLOSURE.md`).
>
> **ZIP EXPORT: MODO LEGACY / OPCIONAL.**
> La exportación a `.zip` (`/api/factory/download`) deja de ser la ruta de
> publicación recomendada y pasa a clasificarse como una exportación manual
> opcional para casos de uso secundarios (respaldo, migración manual, depuración).
> Permanece funcionalmente activa — no fue removida — solo reclasificada en la UI
> y en los comentarios de código fuente (ver §7, fila R4).

Esta decisión fue tomada por el autor antes de 6D-C.1 y quedó reflejada en el código
mediante los cambios de copy y comentarios canónicos de la sub-fase **6D-C.1C**.

## 12. Estado actual del Factory

- Commit de cierre de 6D-C.1: `bc45b53` ("feat(factory): add Lok'al Business Factory
  wizard with access control (6D-C.1)") — 58 archivos, 6650 inserciones, 0 — commiteado
  localmente, **sin push** (rama `main` un commit por delante de `origin/main`).
- Build, lint (0 errores / 0 warnings tras 6D-C.1B) y validación en vivo (36 pruebas
  acumuladas across 6D-C.1A/B/C) — todas PASS.
- **Pendiente para habilitar el guard en producción**: configurar
  `FACTORY_ACCESS_PASSWORD` en Vercel Production. Sin esta variable, el Factory
  desplegado operaría en modo abierto/demo — reproduciendo el riesgo R1/R2 que este
  sprint cerró en el código. Este es el **bloqueador de GO/NO-GO para el deploy**
  (señalado explícitamente por el autor como paso siguiente, pendiente de autorización
  separada).

## 13. Deuda técnica conocida

1. **Duplicación física de tipos entre `scripts/create-business/types.ts` (espejo) y
   `src/lib/factory/types.ts` (canónico)** — necesaria porque `tsx` no resuelve alias
   `@/*` (§5.2). Documentada explícitamente con comentarios JSDoc recíprocos en ambos
   archivos (añadidos en 6D-C.1C). Remediación de raíz pendiente: evaluar la
   extracción de una capa neutral compartida (mencionada como "Opción 3" en el
   precheck de 6D-C.1) en una fase de diseño posterior.
2. **El ZIP permanece funcionalmente activo** pese a su reclasificación a modo legado
   — solo cambió la presentación, no el comportamiento. Cualquier plan de
   deprecación real requeriría una decisión y autorización separadas.
3. **Dependencia de `FACTORY_ACCESS_PASSWORD` configurada manualmente en cada
   entorno** (Vercel Production, y potencialmente staging) — sin un mecanismo de
   verificación automática que impida un despliegue con la variable ausente o con
   placeholder.

## 14. Relación con 6D-C.2

6D-C.2 es el bloque que implementará el **alta directa a la plataforma compartida**
— el reemplazo del flujo "generar → exportar ZIP → desplegar manualmente" por
"generar → publicar directamente en `businesses.config`/`.theme`/`.dna`". El bloque
6D-C.1 preparó el terreno:
- Aseguró el panel y las rutas API que producen ese contenido.
- Alineó la UI y los comentarios de código con el modelo de publicación que 6D-C.2
  implementará (placeholder "Publicar en Lok'al — llega en 6D-C.2" ya presente en
  `/factory/preview`).
- Mantiene `factory/json-types.ts` como el contrato de tipos JSON ya diseñado para
  ese propósito (`FactoryDraft`, `BusinessConfig`, `ThemeConfig` — Sprint 5E).

## 15. Dependencias para 6D-C.2

- **Modelo multi-tenant estable** (bloque 5D, ver `docs/5D-CLOSURE.md`) — tabla
  `businesses` con columnas `config`/`theme`/`dna` JSONB ya presentes en el esquema.
- **Capa de escritura tenant-scoped** (`scopedInsert()`/`resolveBusinessId()`) —
  reutilizable para insertar el nuevo negocio y sus datos iniciales.
- **Contratos de tipos JSON ya definidos** (`json-types.ts`) — listos para
  serializar/deserializar contra las columnas JSONB.
- **Acceso autenticado al Factory** (este sprint) — sin él, exponer un flujo de "alta
  directa a producción" sería significativamente más riesgoso que exponer solo
  generación/exportación.
- **Definir el flujo de aprovisionamiento del propio registro `businesses`** (slug
  único, validaciones, posible necesidad de migraciones o políticas RLS adicionales
  para el alta de nuevos tenants) — diseño aún no iniciado.

## 16. Riesgos pendientes

1. **Deploy sin `FACTORY_ACCESS_PASSWORD` configurada** reproduciría R1/R2 en
   producción — bloqueador de GO/NO-GO (§12).
2. **Duplicación de tipos sin resolver de raíz** — cualquier cambio futuro a los
   contratos de datos requiere disciplina manual para mantener ambas copias
   sincronizadas (§13.1).
3. **6D-C.2 introducirá superficie de escritura directa a producción** desde el
   Factory — su diseño deberá considerar válidaciones, límites de tasa, y
   posiblemente un flujo de aprobación, dado que pasa de "generar contenido" a
   "crear tenants reales".
4. **El placeholder de "Publicar en Lok'al" en la UI crea una expectativa** que
   6D-C.2 deberá cumplir — riesgo de percepción si hay una brecha temporal larga
   entre el copy y la funcionalidad real.

## 17. Recomendaciones

1. **Configurar `FACTORY_ACCESS_PASSWORD` en Vercel Production antes de cualquier
   deploy** que incluya el commit `bc45b53` — paso ya identificado por el autor como
   siguiente, pendiente de autorización.
2. **Planificar una fase de consolidación de tipos** que elimine la duplicación
   `scripts/create-business/types.ts` ↔ `src/lib/factory/types.ts` (evaluar la
   "Opción 3" del precheck — capa neutral compartida).
3. **Diseñar 6D-C.2 explícitamente sobre las dependencias listadas en §15**,
   verificando antes de empezar que el modelo de `businesses` soporta el flujo de alta
   directa sin requerir cambios de esquema adicionales no planeados.
4. **Considerar un chequeo de arranque** (build-time o runtime) que advierta —o
   bloquee— un despliegue a producción si `FACTORY_ACCESS_PASSWORD` no está
   configurada o conserva el valor placeholder, para prevenir estructuralmente la
   reaparición de R1/R2.
5. **Re-evaluar el modo legado del ZIP** una vez 6D-C.2 esté operativo: decidir si se
   mantiene indefinidamente, se deprecia con aviso, o se retira — como decisión
   separada y explícita.

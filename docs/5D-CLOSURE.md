# 5D — Cierre de bloque: Multi-Tenant Core

> **Estado del documento:** Revisado y endurecido — snapshot 5D-STABLE.3 (2026-06-08).
> No commiteado. Sin observaciones pendientes.

## 1. Resumen ejecutivo

El bloque **5D** transformó "Tacos El Compache de Ah Mun" de una aplicación
mono-negocio a una **plataforma multi-tenant** capaz de servir múltiples negocios
desde una única base de código y un único proyecto Supabase, aislando los datos de
cada negocio mediante la columna `business_id` y resolviendo el "negocio activo" por
dominio/slug en tiempo de request (`proxy.ts`).

El trabajo se ejecutó en fases controladas y reversibles (migración nullable → backfill
→ NOT NULL), evitando ventanas de incompatibilidad entre código y esquema. Se
endureció el aislamiento entre tenants mediante auditorías dirigidas
(`5D-TENANT-GUARD`), se migraron las rutas de lectura de menú a `service_role`
(`5D-RLS-0`) como prerrequisito de políticas RLS estrictas, y se realizó limpieza de
artefactos de diagnóstico y datos de prueba (`5D-CLEANUP-*`).

El bloque cierra con la base de datos de producción en estado **multi-tenant estable**
(`business_id NOT NULL` en las 5 tablas afectadas), RLS activo en modo defensa en
profundidad, y cero hallazgos abiertos de fuga entre tenants.

## 2. Timeline completo del bloque 5D

| Fecha | Commit | Hito |
|---|---|---|
| 2026-06-06 16:02 | `aa153b4` | **5D** — Núcleo multi-tenant: tabla `businesses`, `business_id` (nullable), `proxy.ts`, `scopedInsert()`, migraciones 0002a/0002b |
| 2026-06-07 01:23 | `88303fd` | chore(debug) — logging temporal de diagnóstico en `fetchMenu` (instrumentación transitoria, retirada después) |
| 2026-06-07 14:11 | `f65a7a0` | **5D-RLS-0** — migración de `fetchMenu`/`getVerifiedProduct` a cliente `service_role` (prerrequisito de RLS estricto) |
| 2026-06-07 17:17 | `dec795c` | **5D-TENANT-GUARD-1** — refuerzo de `getOrder()`/`updateOrderStatus()` con filtro `business_id` |
| 2026-06-08 10:35 | `28d44ea` | **5D-CLEANUP-1 + 5D-CLEANUP-3** — retiro del logging `[fetchMenu:diag]` de `src/lib/menu.ts` (CLEANUP-1) y actualización documental de `README.md`: RLS, multi-tenant, comportamiento anon/service_role (CLEANUP-3) |

**Operaciones del bloque sin commit de código asociado:**
- **`5D-TENANT-GUARD-0`** — revisión de código (auditoría de aislamiento tenant); sin
  cambios de código. Confirmado por el mensaje del commit `dec795c`: *"Closes the one
  reachable gap found in the 5D-TENANT-GUARD-0 audit."*
- **`5D-CLEANUP-2`** — eliminación de 4 órdenes de diagnóstico mediante DELETE por UUID
  exacto, ejecutado vía SQL Editor. Sin commit de código. Detalle en §12.
- **`5D-RLS-2`** — aplicación de políticas RLS lockdown para `anon`/`authenticated`
  mediante SQL Editor. Sin commit de código. Confirmado por el cuerpo del commit
  `28d44ea`: *"RLS now locks anon out entirely (5D-RLS-2)."*

## 3. Commits relevantes

```
aa153b4  feat(5D): multi-tenant core — business_id isolation + phased migration
88303fd  chore(debug): log fetchMenu Supabase response
f65a7a0  refactor(5D-RLS-0): migrate fetchMenu/getVerifiedProduct to service_role client
dec795c  fix(5D-TENANT-GUARD-1): scope order queries by business_id on service_role routes
28d44ea  chore(5D-cleanup): remove temp diagnostic logging and update RLS docs
```

Commit raíz del bloque: `aa153b4` (2026-06-06). Commit de cierre: `28d44ea`
(2026-06-08), inmediatamente anterior al inicio del bloque 6D-C.1 (`bc45b53`).

## 4. Arquitectura final

- **Modelo de datos:** tabla raíz `public.businesses` (slug, name, config/theme/dna
  JSONB); columna `business_id uuid NOT NULL` añadida y poblada en `categories`,
  `products`, `orders`, `order_items`, `payments`.
- **Resolución de tenant:** `proxy.ts` resuelve el negocio activo a partir del
  dominio/slug entrante en cada request; expone el contexto vía
  `getBusinessContext()`.
- **Capa de escritura:** `scopedInsert()` + `resolveBusinessId()` garantizan que toda
  inserción quede asociada al `business_id` correcto sin depender de que cada llamador
  lo provea manualmente.
- **Capa de lectura:** `fetchMenu()`, `getVerifiedProduct()`, `getOrder()`,
  `fetchOrders()`, `updateOrderStatus()` filtran explícitamente por `business_id` y
  operan vía `service_role` (ver §7).
- **Aislamiento de sesión cliente:** claves de carrito/`sessionStorage` derivadas del
  hostname, evitando colisión de estado entre negocios servidos desde el mismo
  navegador/dispositivo.
- **Compatibilidad de rutas internas:** `BusinessSiteNav` actúa como wrapper de layout
  compatible tanto con los sitios de negocio como con las rutas `/factory`.

## 5. Multi-tenant

El modelo es **una sola aplicación, una sola base de datos, N negocios**. Cada fila de
las tablas operativas (`categories`, `products`, `orders`, `order_items`, `payments`)
pertenece exactamente a un `business_id`. La tabla `businesses` es la raíz de
identidad y configuración (incluye columnas JSONB `config`, `theme`, `dna` — diseñadas
en el sprint 5E para alimentar al Factory, ver `docs/6D-C1-FACTORY.md`).

## 6. Tenant isolation

El aislamiento se garantiza en dos niveles:
1. **Nivel aplicación:** todo acceso de lectura/escritura desde rutas server-side pasa
   por funciones que reciben o resuelven `business_id` y lo aplican como filtro
   explícito (`.eq("business_id", …)`) o como valor de inserción (`scopedInsert`).
2. **Nivel base de datos (defensa en profundidad):** RLS activo en modo lockdown para
   roles `anon`/`authenticated` (ver §9); ningún cliente público puede leer ni escribir
   directamente sobre estas tablas.

`5D-TENANT-GUARD-1` (`dec795c`) cerró la última brecha alcanzable identificada en la
auditoría previa: `getOrder()` y `updateOrderStatus()` no filtraban por `business_id`
en las rutas de `service_role` del panel admin.

## 7. Tenant resolution

`proxy.ts` intercepta cada request, deriva el slug del negocio a partir del dominio
(p. ej. subdominio `{slug}.lok-al.mx`) y construye el contexto de negocio activo
(`getBusinessContext()`) que el resto de la aplicación consume para filtrar datos y
personalizar la UI (tema, copy, configuración). Las rutas bajo `BYPASS_PREFIXES`
(`/factory`, `/_next`, `/images`, `/api/factory`) quedan exentas de esta resolución
porque pertenecen al panel interno del Factory, no a un sitio de negocio.

## 8. Service Role strategy

Dado que el cliente `anon` no tiene mecanismo para propagar `app.business_slug` como
contexto de sesión hacia Postgres, **toda lectura y escritura de la aplicación ocurre
del lado del servidor mediante el cliente `service_role`**, que omite RLS por diseño.
El filtrado por tenant se realiza explícitamente en cada función de acceso a datos
(`.eq("business_id", …)`), siguiendo el mismo patrón ya validado en
`createOrder`/`business-context`/rutas admin. `5D-RLS-0` (`f65a7a0`) extendió este
patrón a `fetchMenu()`/`getVerifiedProduct()`, que hasta entonces usaban el cliente
`anon`.

Esta estrategia es **deliberada y documentada**: RLS no sustituye el filtrado a nivel
aplicación; actúa como segunda capa de contención en caso de que una ruta omitiera el
filtro explícito.

## 9. RLS (Row Level Security)

- **Estado:** activo en modo **lockdown defensivo** para `anon`/`authenticated` — estos
  roles no pueden leer ni escribir ninguna fila de las tablas multi-tenant.
- **Función helper:** `current_business_id()`, creada en `0002_multitenant.sql`/
  `0002a_multitenant_nullable.sql`, queda preparada para soportar aislamiento activo
  por tenant en el futuro (propagación de contexto de sesión), sin requerir rediseño
  adicional.
- **Distinción staging vs. producción:** `0002_multitenant.sql` (versión staging)
  incluye políticas RLS de tipo **tenant-filtering** para `categories` y `products`
  basadas en `current_business_id()`. La ruta de producción (`0002a`/`0002b`) omitió
  deliberadamente esas políticas (diferidas). Las políticas que hoy están activas en
  producción (`5D-RLS-2`) son de tipo **lockdown**: `anon`/`authenticated` bloqueados
  por completo en todas las tablas. Son distintas en diseño y cobertura respecto a las
  de `0002_multitenant.sql`.
- **Hallazgo crítico para el registro histórico — `0003_rls_policies.sql`:**
  > **Las políticas RLS estrictas (`5D-RLS-2`, mencionadas en el commit `28d44ea`)
  > fueron aplicadas manualmente mediante el SQL Editor del proyecto Supabase de
  > producción, y el archivo `0003_rls_policies.sql` correspondiente NO existe
  > actualmente como archivo versionado dentro de `supabase/migrations/`.**
  >
  > Esto constituye una **deuda de trazabilidad**: el estado vivo de la base de datos
  > de producción contiene políticas que no tienen una representación en el control de
  > versiones. Se documenta explícitamente aquí para que cualquier reconstrucción futura
  > del esquema (nuevo entorno, disaster recovery, onboarding) sepa que debe
  > **extraer las políticas activas directamente de producción** (`pg_policies`) y
  > versionarlas retroactivamente como `0003_rls_policies.sql` antes de poder
  > confiar en `supabase/migrations/` como fuente única de verdad del esquema.
- **Confirmación textual (README, post `28d44ea`):** "RLS activo en modo defensa en
  profundidad: las políticas actuales operan en modo lockdown defensivo para clientes
  anon/authenticated. Toda lectura y escritura de la aplicación ocurre del lado del
  servidor mediante `service_role`."

## 10. 5D-TENANT-GUARD

- **`5D-TENANT-GUARD-1`** (`dec795c`, 2026-06-07): añadió parámetro opcional
  `businessId` a `getOrder()` y `updateOrderStatus()`, alineándolos con el patrón ya
  usado en `fetchOrders()`/`getVerifiedProduct()`. Cerró la única brecha alcanzable
  detectada en la auditoría `5D-TENANT-GUARD-0` (las actualizaciones de estado de
  orden desde el panel admin carecían de filtro por tenant) y endureció `getOrder()`
  (código actualmente sin uso activo) de cara a una futura reactivación. También
  documentó por qué la actualización final de `orders` en el webhook de Mercado Pago
  es segura sin filtro explícito de `business_id`.
- **`5D-TENANT-GUARD-0`** — auditoría de aislamiento tenant; fase de revisión de código
  sin cambios ni commit asociado. Fuente: el mensaje del commit `dec795c` cita
  explícitamente *"the 5D-TENANT-GUARD-0 audit"* como antecedente que identificó la
  brecha cerrada en TENANT-GUARD-1.

## 11. 5D-RLS

- **`5D-RLS-0`** (`f65a7a0`, 2026-06-07): migró `fetchMenu()`/`getVerifiedProduct()`
  de cliente `anon` a `service_role`, preservando los filtros explícitos
  `.eq("business_id", …)`. Paso prerrequisito obligatorio antes de poder activar
  políticas RLS estrictas basadas en `current_business_id()`, ya que el cliente `anon`
  no puede propagar `app.business_slug`.
- **`5D-RLS-2`** — aplicación de políticas RLS lockdown para `anon`/`authenticated`
  mediante SQL Editor de producción (operación directa, sin commit de código
  versionado). Confirmado por el cuerpo del commit `28d44ea`: *"RLS now locks anon out
  entirely (5D-RLS-2), with service_role handling all reads/writes server-side."*
  Corresponde a la aplicación manual de `0003_rls_policies.sql` (ver §9). Nota: no
  existe ninguna fase rotulada `5D-RLS-1` en el historial de commits ni en la
  documentación del bloque. La secuencia fue `5D-RLS-0` (commit de código,
  prerrequisito) → `5D-RLS-2` (operación SQL Editor, lockdown efectivo).

## 12. 5D-CLEANUP-1, 5D-CLEANUP-2, 5D-CLEANUP-3

- **`5D-CLEANUP-2`** ✅ verificado: eliminación transaccional (bloques DELETE por UUID
  exacto) de 4 órdenes de diagnóstico:
  `17a97aa6-6b52-4ac3-8936-94a62dc97101`,
  `220a4c33-3d89-40e3-92b1-7b47e9f559f4`,
  `7800742d-237c-4399-a63a-a075e4f0aa8a`,
  `41b2a3bc-b362-4e28-a45c-93666fafa161`.
  Resultado verificado: `orders` 7→3, `order_items` 15→11.
- **`5D-CLEANUP-1`** (commit `28d44ea`, 2026-06-08): retiro del logging temporal
  `[fetchMenu:diag]` de `src/lib/menu.ts`. El bloque `console.log` fue añadido
  intencionalmente durante la sesión `5D-9F-D.2` para diagnosticar el comportamiento
  de `fetchMenu`; su causa raíz fue confirmada, y este cleanup lo retiró.
- **`5D-CLEANUP-3`** (commit `28d44ea`, 2026-06-08): actualización documental de
  `README.md` — corrección de la documentación RLS (el README previo afirmaba
  incorrectamente que el cliente `anon` podía leer el menú), adición de la descripción
  multi-tenant, y documentación del comportamiento actual anon/service_role.

  *Nota: 5D-CLEANUP-1 y 5D-CLEANUP-3 fueron agrupados en el mismo commit `28d44ea`
  ("chore(5D-cleanup): remove temp diagnostic logging and update RLS docs"). La
  separación entre CLEANUP-1 (código) y CLEANUP-3 (documentación) es conceptual, no
  estructural a nivel de commit.*

## 13. Estado final de staging

El estado del proyecto Supabase de staging no fue verificado durante esta fase
documental — ninguna consulta fue ejecutada contra staging en el alcance del presente
snapshot. Las cabeceras de `0002_multitenant.sql` y `0002a_multitenant_nullable.sql`
instruyen *"Ejecutar PRIMERO en un proyecto Supabase de STAGING"*, consistente con el
proceso seguido, pero el estado exacto de staging (en particular si
`0003_rls_policies.sql` fue aplicado ahí o no) queda fuera del alcance de este
documento. Ver riesgo residual #2 en §15.

## 14. Estado final de producción

Verificado a través de migraciones, commits y README al cierre del bloque (2026-06-08):

- Proyecto Supabase de producción: `lbucsbchtwmhckyfbwkw`.
- Esquema: `business_id NOT NULL` activo en `categories`, `products`, `orders`,
  `order_items`, `payments` (aplicado vía `0002b_multitenant_notnull.sql`, que
  incluye PRE-CHECK de cero `NULL`s antes de aplicar la restricción).
- Negocio #1 (`compache` / Tacos El Compache de Ah Mun) operando como tenant activo
  sobre el nuevo modelo, con datos existentes migrados vía backfill (`0002a`).
- RLS activo en modo lockdown defensivo para `anon`/`authenticated`; `service_role`
  maneja toda lectura/escritura server-side.
- Sin logging de diagnóstico residual (retirado en `28d44ea`).
- Sin órdenes de prueba/diagnóstico residuales (retiradas en `5D-CLEANUP-2`).
- Producción: `https://tacos-el-compache.vercel.app` — repo `danjaguar520/tacos-el-compache-`.

## 15. Riesgos residuales

1. **Trazabilidad de esquema incompleta** — `0003_rls_policies.sql` no existe como
   archivo versionado; el estado vivo de RLS en producción no puede reconstruirse
   solo desde `supabase/migrations/` (ver §9). *Severidad: media — afecta
   recuperación ante desastres y onboarding, no la operación actual.*
2. **Posible desincronización staging/producción** — si `0003_rls_policies.sql` fue
   aplicado solo en producción (no en staging), el entorno de staging podría no
   reflejar el estado de RLS de producción. El estado de staging no fue verificado en
   el alcance de este snapshot (ver §13). *Severidad: media.*
3. **`current_business_id()` sin uso activo** — la función helper está creada y lista,
   pero el aislamiento activo por tenant a nivel RLS (más allá del lockdown) depende
   de propagar contexto de sesión desde la aplicación, lo cual no está implementado.
   *Severidad: baja — el filtrado a nivel aplicación ya cubre el caso de uso actual.*
4. **`getOrder()` es código sin uso activo pero ya endurecido** — riesgo latente si se
   reactiva sin revisar el contexto de `5D-TENANT-GUARD-1`. *Severidad: baja —
   mitigado preventivamente.*

## 16. Lessons learned

- **La migración por fases (nullable → backfill → NOT NULL) evitó ventanas de
  incompatibilidad**: permitió desplegar código nuevo y ejecutar la migración de
  esquema de forma independiente y con rollback seguro en cada paso (documentado en
  las cabeceras de `0002a`/`0002b`).
- **Migrar las rutas de lectura a `service_role` *antes* de activar RLS estricto fue
  la secuencia correcta** (`5D-RLS-0` como prerrequisito): intentar el orden inverso
  habría roto la lectura pública del menú.
- **Las auditorías dirigidas (`5D-TENANT-GUARD-0/1`) detectan brechas que las pruebas
  funcionales no cubren** — el caso de `getOrder()`/`updateOrderStatus()` sin filtro de
  tenant no habría producido errores visibles en el flujo normal (un solo tenant en
  producción), solo una fuga potencial en un escenario multi-tenant real.
- **Aplicar cambios de RLS manualmente vía SQL Editor introduce deuda de
  trazabilidad** — aunque puede ser válido operacionalmente (rapidez, control directo
  en producción), deja al control de versiones desactualizado respecto al estado real
  de la base de datos. Esta lección motiva la recomendación de la sección siguiente.

## 17. Recomendaciones futuras

1. **Versionar retroactivamente `0003_rls_policies.sql`**: extraer las políticas
   activas de producción (`pg_policies` vía SQL Editor o `pg_dump --schema-only`
   filtrado) y commitearlas como migración versionada, documentando que representa el
   estado *ya aplicado* (no una migración pendiente de ejecutar).
2. **Verificar y, de ser necesario, sincronizar staging** con el estado de RLS de
   producción (cierra el riesgo residual #2).
3. **Establecer una convención explícita** para cuándo un cambio de esquema/política
   se aplica vía archivo de migración versionado vs. manualmente — y, si se opta por lo
   manual, un proceso obligatorio de "versionar después" para no perder trazabilidad.
4. **Evaluar activar aislamiento RLS activo por tenant** (más allá del lockdown)
   aprovechando `current_business_id()`, si el modelo multi-tenant escala a un volumen
   donde la defensa en profundidad a nivel de base de datos se vuelva prioritaria.

---

## Anexo — Migraciones documentadas

| Archivo | Estado | Resumen |
|---|---|---|
| `0001_init.sql` | Versionado | Esquema inicial mono-negocio: `categories`, `products`, `customers`, `orders`, `order_items`, `payments`. Precios en centavos. Extensión `pgcrypto`. |
| `0002_multitenant.sql` | Versionado | Sprint 5D-1 — versión "todo en uno" del núcleo multi-tenant: tabla `businesses`, `business_id` en las 5 tablas, backfill, índices, políticas RLS iniciales, `current_business_id()`. Documentada como ejecución de staging-primero. |
| `0002a_multitenant_nullable.sql` | Versionado, **aplicado en producción** | Sprint 5D — Fase 1/2: crea `businesses`, agrega `business_id` (NULLABLE), backfill, índices, `current_business_id()`. Deliberadamente NO toca RLS ni agrega `NOT NULL` (diferido a 0002b). Incluye rollback documentado. |
| `0002b_multitenant_notnull.sql` | Versionado, **aplicado en producción** | Sprint 5D — Fase 2/2: PRE-CHECK transaccional de cero `NULL`s en las 5 tablas, luego aplica `NOT NULL` en `business_id`, con verificación POST-CHECK y rollback de emergencia documentado (<10s). |
| `0003_rls_policies.sql` | **NO EXISTE como archivo versionado** | Las políticas RLS estrictas (lockdown defensivo, `5D-RLS-2`) fueron **aplicadas manualmente mediante el SQL Editor** del proyecto Supabase de producción. No hay archivo correspondiente en `supabase/migrations/`. Ver §9 para el riesgo de trazabilidad asociado y la recomendación de versionado retroactivo. |

> **Nota — relación entre 0002 y 0002a/0002b:** `0002_multitenant.sql` es la versión
> de staging (todo-en-uno): esquema + backfill + NOT NULL + políticas RLS de tipo
> tenant-filtering (`current_business_id()`). Su cabecera dice explícitamente:
> *"Ejecutar PRIMERO en un proyecto Supabase de STAGING. Solo ejecutar en producción
> después de aprobación explícita de Sprint 5D-8."* El par `0002a`/`0002b` es la ruta
> de producción real (phased): nullable primero, NOT NULL después, sin RLS (diferido
> deliberadamente). Los tres archivos coexisten en el repositorio desde el mismo commit
> (`aa153b4`). Las políticas RLS activas en producción hoy (`5D-RLS-2`) son distintas
> de las de staging: staging usó tenant-filtering vía `current_business_id()`;
> producción recibió lockdown total (`anon`/`authenticated` bloqueados) aplicado
> manualmente como `0003_rls_policies.sql`.

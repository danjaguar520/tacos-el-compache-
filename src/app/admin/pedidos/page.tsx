import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Order, OrderStatus } from "@/types";
import { formatMXN } from "@/lib/format";
import { getAdminClient, isSupabaseWritable } from "@/lib/supabase/server";
import { isAdminConfigured, isAuthenticated } from "@/lib/admin-auth";
import { OrderStatusControls } from "@/components/admin/OrderStatusControls";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = { title: "Panel de Pedidos" };
export const dynamic = "force-dynamic";

const COLUMNAS: { status: OrderStatus; label: string; color: string }[] = [
  { status: "recibido", label: "Recibidos", color: "bg-barro" },
  { status: "pendiente", label: "Pendientes", color: "bg-naranja" },
  { status: "pagado", label: "Pagados", color: "bg-epazote" },
  { status: "cancelado", label: "Cancelados", color: "bg-chile" },
];

async function fetchOrders(): Promise<Order[]> {
  if (!isSupabaseWritable()) return [];
  const admin = getAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data as Order[]) ?? [];
}

export default async function PanelPedidosPage() {
  // Protección: si hay contraseña configurada, exigir sesión.
  if (isAdminConfigured() && !(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const orders = await fetchOrders();
  const configured = isSupabaseWritable();

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-chile">Panel de Pedidos</h1>
          <p className="text-sm text-frijol/60">Administra el estado de cada pedido.</p>
        </div>
        {isAdminConfigured() && <LogoutButton />}
      </header>

      {!isAdminConfigured() && (
        <p className="mt-4 rounded-xl bg-naranja/15 px-4 py-2.5 text-sm font-medium text-barro">
          ⚠️ Panel sin protección. Configura{" "}
          <code className="rounded bg-maiz/60 px-1">ADMIN_PASSWORD</code> para exigir acceso.
        </p>
      )}

      {!configured ? (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10">
          <p className="font-display text-xl font-bold text-frijol">Supabase no configurado</p>
          <p className="mt-2 text-sm text-frijol/60">
            Configura <code className="rounded bg-maiz/60 px-1">SUPABASE_SERVICE_ROLE_KEY</code> y
            aplica las migraciones para ver y administrar los pedidos en vivo.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {COLUMNAS.map((col) => {
            const items = orders.filter((o) => o.status === col.status);
            return (
              <section key={col.status} className="rounded-2xl bg-white/60 p-3 ring-1 ring-barro/10">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 font-display text-lg font-bold text-frijol">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                    {col.label}
                  </span>
                  <span className="rounded-full bg-frijol/10 px-2 py-0.5 text-xs font-bold text-frijol">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {items.length === 0 ? (
                    <p className="px-1 py-6 text-center text-xs text-frijol/40">Sin pedidos</p>
                  ) : (
                    items.map((o) => <OrderCard key={o.id} order={o} />)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const fecha = new Date(order.created_at).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <article className="rounded-xl bg-white p-3 shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10">
      <div className="flex items-center justify-between">
        <span className="font-bold text-frijol">#{order.id.slice(0, 8).toUpperCase()}</span>
        <span className="font-display font-bold text-chile">{formatMXN(order.total_cents)}</span>
      </div>
      <p className="mt-0.5 text-sm text-frijol/75">{order.customer_name}</p>
      <p className="text-xs text-frijol/50">
        {order.customer_phone} · {order.delivery_method === "domicilio" ? "🛵 Domicilio" : "🏪 Recoger"}
      </p>
      {order.order_items && order.order_items.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-frijol/60">
          {order.order_items.map((it) => (
            <li key={it.id}>{it.quantity}× {it.product_name}</li>
          ))}
        </ul>
      )}
      {order.notes && (
        <p className="mt-2 rounded bg-maiz/40 px-2 py-1 text-xs text-frijol/70">📝 {order.notes}</p>
      )}
      <p className="mt-2 text-[0.7rem] text-frijol/40">{fecha}</p>

      <OrderStatusControls orderId={order.id} current={order.status} />
    </article>
  );
}

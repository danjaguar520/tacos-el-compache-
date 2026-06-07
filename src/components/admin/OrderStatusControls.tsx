"use client";

import { useState, useTransition } from "react";
import type { OrderStatus } from "@/types";
import { updateOrderStatus } from "@/app/admin/actions";

const OPTIONS: { status: OrderStatus; label: string; active: string }[] = [
  { status: "recibido", label: "Recibido", active: "bg-barro text-crema" },
  { status: "pendiente", label: "Pendiente", active: "bg-naranja text-crema" },
  { status: "pagado", label: "Pagado", active: "bg-epazote text-crema" },
  { status: "cancelado", label: "Cancelado", active: "bg-chile text-crema" },
];

/** Botones para cambiar el estado de un pedido (optimista + manejo de error). */
export function OrderStatusControls({
  orderId,
  current,
  businessId,
}: {
  orderId: string;
  current: OrderStatus;
  businessId?: string | null;
}) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function change(next: OrderStatus) {
    if (next === status || isPending) return;
    const prev = status;
    setStatus(next); // optimista
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, next, businessId);
      if (!res.ok) {
        setStatus(prev); // revertir
        setError(res.error ?? "No se pudo actualizar.");
      }
    });
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1.5">
        {OPTIONS.map((o) => {
          const isActive = o.status === status;
          return (
            <button
              key={o.status}
              onClick={() => change(o.status)}
              disabled={isPending}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60 ${
                isActive
                  ? o.active
                  : "bg-frijol/5 text-frijol/60 hover:bg-frijol/10"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-chile">{error}</p>}
    </div>
  );
}

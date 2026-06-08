"use client";

import { useFactoryStore } from "@/lib/factory-store";
import type { Categoria } from "@/lib/factory/types";

function toSlug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function StepCatalogo({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft  = useFactoryStore((s) => s.draft);
  const update = useFactoryStore((s) => s.updateDraft);

  const categorias: Categoria[] = (draft.categorias as Categoria[]) ?? [
    { nombre: "", slug: "", productos: [{ nombre: "", precio: 0, descripcion: "" }] },
  ];

  function setCat(i: number, field: keyof Omit<Categoria, "productos">, value: string) {
    const next = categorias.map((c, ci) =>
      ci === i ? { ...c, [field]: field === "nombre" ? value : value, slug: field === "nombre" ? toSlug(value) : (field === "slug" ? value : c.slug) } : c
    );
    update({ categorias: next });
  }

  function setProd(ci: number, pi: number, field: "nombre" | "precio" | "descripcion", value: string | number) {
    const next = categorias.map((c, cIdx) => cIdx === ci ? {
      ...c,
      productos: c.productos.map((p, pIdx) => pIdx === pi ? { ...p, [field]: value } : p),
    } : c);
    update({ categorias: next });
  }

  function addProd(ci: number) {
    const next = categorias.map((c, cIdx) => cIdx === ci
      ? { ...c, productos: [...c.productos, { nombre: "", precio: 0, descripcion: "" }] }
      : c);
    update({ categorias: next });
  }

  function removeProd(ci: number, pi: number) {
    const next = categorias.map((c, cIdx) => cIdx === ci
      ? { ...c, productos: c.productos.filter((_, pIdx) => pIdx !== pi) }
      : c);
    update({ categorias: next });
  }

  function addCat() {
    update({ categorias: [...categorias, { nombre: "", slug: "", productos: [{ nombre: "", precio: 0, descripcion: "" }] }] });
  }

  function removeCat(i: number) {
    update({ categorias: categorias.filter((_, ci) => ci !== i) });
  }

  const isValid = categorias.some((c) => c.nombre.trim().length > 0 && c.productos.some((p) => p.nombre.trim().length > 0));

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Las descripciones de productos serán generadas por Claude — solo proporciona nombre y precio.</p>

      {categorias.map((cat, ci) => (
        <div key={ci} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <input value={cat.nombre} onChange={(e) => setCat(ci, "nombre", e.target.value)}
              placeholder={`Categoría ${ci + 1} (ej: Cortes)`}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-400" />
            {categorias.length > 1 && (
              <button onClick={() => removeCat(ci)} className="text-gray-300 hover:text-red-400 text-xs">Eliminar</button>
            )}
          </div>

          <div className="space-y-2 pl-2">
            {cat.productos.map((prod, pi) => (
              <div key={pi} className="flex gap-2 items-center">
                <input value={prod.nombre} onChange={(e) => setProd(ci, pi, "nombre", e.target.value)}
                  placeholder="Nombre del producto"
                  className="flex-1 rounded-lg border border-gray-100 px-3 py-1.5 text-sm outline-none focus:border-blue-400" />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">$</span>
                  <input type="number" value={prod.precio || ""} onChange={(e) => setProd(ci, pi, "precio", Number(e.target.value))}
                    placeholder="Precio"
                    className="w-24 rounded-lg border border-gray-100 px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
                </div>
                {cat.productos.length > 1 && (
                  <button onClick={() => removeProd(ci, pi)} className="text-gray-200 hover:text-red-400">✕</button>
                )}
              </div>
            ))}
            <button onClick={() => addProd(ci)} className="text-xs font-medium text-blue-400 hover:text-blue-600 pl-1">+ Agregar producto</button>
          </div>
        </div>
      ))}

      <button onClick={addCat} className="text-sm font-semibold text-blue-500 hover:text-blue-700">
        + Agregar categoría
      </button>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-full border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50">← Atrás</button>
        <button onClick={onNext} disabled={!isValid} className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-40">Continuar →</button>
      </div>
    </div>
  );
}

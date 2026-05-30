import Link from "next/link";

export default function FailurePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-chile text-crema text-4xl">
        ✕
      </div>
      <h1 className="mt-5 font-display text-4xl font-bold text-chile">No se completó el pago</h1>
      <p className="mt-2 text-frijol/70">
        Algo salió mal y tu pago no pudo procesarse. No te preocupes, no se realizó ningún cargo.
        Tu carrito sigue guardado.
      </p>
      <div className="mt-7 flex flex-col gap-3">
        <Link
          href="/checkout"
          className="inline-flex w-full items-center justify-center rounded-full bg-chile px-6 py-3.5 font-semibold text-crema hover:bg-chile-700"
        >
          Intentar de nuevo
        </Link>
        <Link
          href="/carrito"
          className="inline-flex w-full items-center justify-center rounded-full bg-maiz px-6 py-3.5 font-semibold text-frijol hover:brightness-95"
        >
          Revisar mi carrito
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-naranja text-crema text-4xl">
        ⏳
      </div>
      <h1 className="mt-5 font-display text-4xl font-bold text-naranja">Pago en proceso</h1>
      <p className="mt-2 text-frijol/70">
        Tu pago se está confirmando. En cuanto se acredite, comenzaremos a preparar tu pedido.
        Te avisaremos si necesitamos algo más.
      </p>
      <div className="mt-7 flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-full bg-chile px-6 py-3.5 font-semibold text-crema hover:bg-chile-700"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

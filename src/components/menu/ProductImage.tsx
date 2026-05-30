"use client";

import { useState } from "react";

/**
 * Imagen de producto con respaldo de marca.
 * Si la imagen no existe (placeholders aún sin subir), muestra un degradado
 * cálido con un emoji de taco/bebida en lugar de un ícono roto.
 *
 * Detecta el fallo tanto con `onError` como con un ref (por si el error ocurre
 * antes de la hidratación de React, en cuyo caso `onError` no se dispara).
 */
export function ProductImage({
  src,
  alt,
  emoji = "🌮",
  className = "",
}: {
  src: string | null;
  alt: string;
  emoji?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-barro to-chile ${className}`}
        aria-label={alt}
        role="img"
      >
        <span className="text-4xl opacity-90">{emoji}</span>
      </div>
    );
  }

  return (
    // Imagen sencilla con respaldo onError; evitamos next/image porque las
    // fotos son archivos locales opcionales que pueden no existir aún.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(el) => {
        // El error pudo ocurrir antes de hidratar: detectarlo al montar.
        if (el && el.complete && el.naturalWidth === 0) setFailed(true);
      }}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

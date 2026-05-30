-- ============================================================
-- Seed: categorías + menú (15 guisos + aguas y refrescos)
-- Coincide con src/data/menu.ts. Precios en centavos.
-- Idempotente: usa upsert por slug/nombre.
-- ============================================================

insert into public.categories (name, slug, sort_order) values
  ('Tacos de Guisos', 'tacos-de-guisos', 1),
  ('Aguas y Refrescos', 'aguas-y-refrescos', 2)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- Tacos de guisos
insert into public.products (category_id, name, description, price_cents, image_url, sort_order)
select c.id, v.name, v.description, v.price_cents, v.image_url, v.sort_order
from (values
  ('Taco de Birria', 'Res deshebrada en su consomé de chiles, suave y jugosa.', 3500, '/menu/birria.jpg', 1),
  ('Taco de Milanesa de Pollo', 'Milanesa de pollo empanizada, crujiente y doradita.', 3500, '/menu/milanesa-pollo.jpg', 2),
  ('Taco de Mole', 'Pollo bañado en mole de la casa, con su toque dulce y picante.', 3500, '/menu/mole.jpg', 3),
  ('Taco de Chicharrón en Salsa Verde', 'Chicharrón guisado a fuego lento en salsa verde de tomatillo.', 3500, '/menu/chicharron-salsa-verde.jpg', 4),
  ('Taco de Chicharrón Prensado', 'Guiso tradicional preparado diariamente, lleno de sabor.', 3500, '/menu/chicharron-prensado.jpg', 5),
  ('Taco de Tinga de Pollo', 'Pollo deshebrado en salsa de chipotle con cebolla y jitomate.', 3500, '/menu/tinga-pollo.jpg', 6),
  ('Taco de Picadillo', 'Carne molida guisada con papa y zanahoria, sabor casero.', 3500, '/menu/picadillo.jpg', 7),
  ('Taco de Rajas con Elote', 'Rajas de chile poblano con elote y crema. Vegetariano.', 3500, '/menu/rajas-elote.jpg', 8),
  ('Taco de Papas en Salsa Verde', 'Papas guisadas en salsa verde, suaves y reconfortantes.', 3000, '/menu/papas-salsa-verde.jpg', 9),
  ('Taco de Frijoles Puercos', 'Frijoles refritos con chorizo y queso, cremosos y sabrosos.', 3000, '/menu/frijoles-puercos.jpg', 10),
  ('Taco de Carne Deshebrada', 'Res deshebrada guisada en salsa roja con especias.', 3500, '/menu/carne-deshebrada.jpg', 11),
  ('Taco de Pollo en Mole', 'Pollo tierno en mole espeso, receta de familia.', 3500, '/menu/pollo-mole.jpg', 12),
  ('Taco de Huitlacoche', 'El caviar mexicano, guisado con epazote y cebolla.', 4000, '/menu/huitlacoche.jpg', 13),
  ('Taco de Machaca con Huevo', 'Machaca de res revuelta con huevo, ideal para el desayuno.', 3500, '/menu/machaca-huevo.jpg', 14),
  ('Taco de Nopales con Chile', 'Nopales guisados con chile y especias. Vegano.', 3000, '/menu/nopales-chile.jpg', 15)
) as v(name, description, price_cents, image_url, sort_order)
cross join (select id from public.categories where slug = 'tacos-de-guisos') c
where not exists (select 1 from public.products p where p.name = v.name);

-- Aguas y refrescos
insert into public.products (category_id, name, description, price_cents, image_url, sort_order)
select c.id, v.name, v.description, v.price_cents, v.image_url, v.sort_order
from (values
  ('Agua de Horchata', 'Agua fresca de arroz con canela, dulce y refrescante.', 2500, '/menu/agua-horchata.jpg', 1),
  ('Agua de Jamaica', 'Flor de jamaica natural, ligeramente ácida.', 2500, '/menu/agua-jamaica.jpg', 2),
  ('Agua de Limón', 'Limón recién exprimido, bien fría.', 2500, '/menu/agua-limon.jpg', 3),
  ('Agua del Día', 'Pregunta por el sabor natural de hoy.', 2500, '/menu/agua-del-dia.jpg', 4),
  ('Refresco', 'Refresco embotellado de tu preferencia.', 2000, '/menu/refresco.jpg', 5)
) as v(name, description, price_cents, image_url, sort_order)
cross join (select id from public.categories where slug = 'aguas-y-refrescos') c
where not exists (select 1 from public.products p where p.name = v.name);

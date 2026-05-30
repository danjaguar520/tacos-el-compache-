/** Tipos compartidos en toda la app (menú, carrito, pedidos). */

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  category_slug: string;
  name: string;
  description: string;
  /** Precio en centavos para evitar errores de punto flotante. $35 = 3500. */
  price_cents: number;
  image_url: string | null;
  available: boolean;
  sort_order: number;
}

/** Línea del carrito: un producto + cantidad. */
export interface CartItem {
  productId: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  quantity: number;
}

export type DeliveryMethod = "recoger" | "domicilio";

export type OrderStatus = "recibido" | "pendiente" | "pagado" | "cancelado";

/** Datos que el cliente envía al confirmar el pedido. */
export interface CheckoutPayload {
  customer_name: string;
  customer_phone: string;
  notes: string;
  delivery_method: DeliveryMethod;
  items: { productId: string; quantity: number }[];
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  notes: string | null;
  delivery_method: DeliveryMethod;
  status: OrderStatus;
  subtotal_cents: number;
  total_cents: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
}

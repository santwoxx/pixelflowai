// Mercado Pago helper configuration for handling payments
export const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "APP_USR-b3b34832-d8ea-4493-b87b-94514c669de6";
export const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "APP_USR-6849257751380021-052922-abd88e74338a975c52c9e547ae7ac7d3-3436965718";

export function getMercadoPagoHeaders() {
  return {
    "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

import { NextRequest, NextResponse } from "next/server";
import { MERCADOPAGO_ACCESS_TOKEN, getMercadoPagoHeaders } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, tier } = await req.json();

    if (!userId || !tier) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    let unitPrice = 29.00;
    let title = "PixelFlow AI - Plano Profissional (Acesso Ilimitado)";
    let description = "Acesso ilimitado ao reprocessamento e refinamento estético de imagens.";

    if (tier === "business") {
      unitPrice = 79.00;
      title = "PixelFlow AI - Plano Corporativo (Em Lote)";
      description = "Processamento em lote simultâneo sem limite de concorrência.";
    }

    const domain = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    // Create Preference API Payload for Mercado Pago Checkout Pro
    const payload = {
      items: [
        {
          id: `plan-${tier}`,
          title,
          description,
          quantity: 1,
          unit_price: unitPrice,
          currency_id: "BRL",
        }
      ],
      payer: {
        email: email || "usuario@pixelflow.ai",
      },
      back_urls: {
        success: `${domain}/checkout-success?userId=${userId}&tier=${tier}`,
        failure: `${domain}/?payment-cancel=true`,
        pending: `${domain}/checkout-success?userId=${userId}&tier=${tier}`,
      },
      auto_return: "approved",
      external_reference: userId,
      metadata: {
        user_id: userId,
        tier,
      }
    };

    const response = await fetch("https://api.mercadopago.com/v1/preferences", {
      method: "POST",
      headers: getMercadoPagoHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Mercado Pago API error details:", errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const preference = await response.json();

    // Prefer sandbox redirect url if not in rigid live mode (always has both init_point and sandbox_init_point)
    // We provide init_point as the main standard, which has fallback sandbox if standard credentials are sandbox.
    const url = preference.sandbox_init_point || preference.init_point;

    return NextResponse.json({
      id: preference.id,
      url: url,
    });

  } catch (err: any) {
    console.error("Mercado Pago Checkout error:", err);
    return NextResponse.json(
      { error: "Não foi possível iniciar o checkout do Mercado Pago." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, tier } = await req.json();

    if (!userId || !tier) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    let url = "";

    if (tier === "pro" || tier === "profissional") {
      url = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=60c4b577ef484587a2416cfcd32421eb&external_reference=${userId}&email=${encodeURIComponent(email || "")}`;
    } else {
      url = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=38092dc79d2440ac8ffba85282893b4a&external_reference=${userId}&email=${encodeURIComponent(email || "")}`;
    }

    return NextResponse.json({
      id: `preapproval-${tier}`,
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

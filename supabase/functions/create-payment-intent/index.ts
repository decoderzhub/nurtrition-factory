import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@19.3.1";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreatePaymentIntentRequest {
  amount: number;
  userId?: string;
  items: Array<{ productId: string; quantity: number }>;
  discountCode?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-11-20.acacia",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    const { amount, userId, items, discountCode }: CreatePaymentIntentRequest = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    let customerId;

    if (userId) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("stripe_customer_id, full_name")
        .eq("id", userId)
        .single();

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id;
      } else if (profile) {
        const customer = await stripe.customers.create({
          metadata: {
            supabase_user_id: userId,
          },
          name: profile.full_name || undefined,
        });
        customerId = customer.id;

        await supabase
          .from("user_profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);
      }
    }

    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        user_id: userId || "guest",
        items: JSON.stringify(items),
      },
    };

    if (customerId) {
      paymentIntentData.customer = customerId;
    }

    if (discountCode) {
      const { data: discount } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", discountCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (discount?.stripe_coupon_id) {
        paymentIntentData.metadata.discount_code = discountCode;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

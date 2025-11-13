import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@19.3.1";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SyncDiscountRequest {
  discountId: string;
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    const { discountId }: SyncDiscountRequest = await req.json();

    const { data: discount, error: fetchError } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("id", discountId)
      .single();

    if (fetchError || !discount) {
      throw new Error("Discount code not found");
    }

    if (discount.stripe_coupon_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Discount already synced to Stripe",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let stripeCoupon;

    if (discount.discount_type === "percentage") {
      stripeCoupon = await stripe.coupons.create({
        name: discount.code,
        percent_off: discount.discount_value,
        duration: discount.duration,
        duration_in_months: discount.duration === "repeating" ? discount.duration_in_months : undefined,
        max_redemptions: discount.max_redemptions || undefined,
        redeem_by: discount.expires_at ? Math.floor(new Date(discount.expires_at).getTime() / 1000) : undefined,
        metadata: {
          database_id: discount.id,
          code: discount.code,
        },
      });
    } else {
      stripeCoupon = await stripe.coupons.create({
        name: discount.code,
        amount_off: Math.round(discount.discount_value * 100),
        currency: "usd",
        duration: discount.duration,
        duration_in_months: discount.duration === "repeating" ? discount.duration_in_months : undefined,
        max_redemptions: discount.max_redemptions || undefined,
        redeem_by: discount.expires_at ? Math.floor(new Date(discount.expires_at).getTime() / 1000) : undefined,
        metadata: {
          database_id: discount.id,
          code: discount.code,
        },
      });
    }

    const { error: updateError } = await supabase
      .from("discount_codes")
      .update({
        stripe_coupon_id: stripeCoupon.id,
      })
      .eq("id", discountId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        stripeCouponId: stripeCoupon.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error syncing discount:", error);

    return new Response(
      JSON.stringify({
        success: false,
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

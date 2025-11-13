import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@19.3.1";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SyncProductRequest {
  productId: string;
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

    const { productId }: SyncProductRequest = await req.json();

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      throw new Error("Product not found");
    }

    await supabase
      .from("products")
      .update({ stripe_sync_status: "syncing", stripe_sync_error: null })
      .eq("id", productId);

    let stripeProduct;
    
    if (product.stripe_product_id) {
      stripeProduct = await stripe.products.update(product.stripe_product_id, {
        name: product.name,
        description: product.description || undefined,
        images: product.image_url ? [product.image_url] : undefined,
        active: true,
        metadata: {
          database_id: product.id,
          is_subscription: product.is_subscription ? "true" : "false",
        },
      });
    } else {
      stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description || undefined,
        images: product.image_url ? [product.image_url] : undefined,
        active: true,
        metadata: {
          database_id: product.id,
          is_subscription: product.is_subscription ? "true" : "false",
        },
      });
    }

    let stripePrice;
    
    if (product.is_subscription) {
      const interval = product.subscription_interval || "month";
      const intervalCount = product.subscription_interval_count || 1;

      if (product.stripe_price_id) {
        await stripe.prices.update(product.stripe_price_id, {
          active: false,
        });
      }

      stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(product.price * 100),
        currency: "usd",
        recurring: {
          interval: interval as Stripe.Price.Recurring.Interval,
          interval_count: intervalCount,
        },
        metadata: {
          database_id: product.id,
        },
      });
    } else {
      if (product.stripe_price_id) {
        stripePrice = await stripe.prices.update(product.stripe_price_id, {
          active: true,
          metadata: {
            database_id: product.id,
          },
        });
      } else {
        stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(product.price * 100),
          currency: "usd",
          metadata: {
            database_id: product.id,
          },
        });
      }
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        stripe_sync_status: "synced",
        stripe_sync_error: null,
        stripe_last_synced_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error syncing product:", error);

    const { productId } = await req.json().catch(() => ({ productId: null }));
    
    if (productId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
      );
      
      await supabase
        .from("products")
        .update({
          stripe_sync_status: "error",
          stripe_sync_error: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", productId);
    }

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

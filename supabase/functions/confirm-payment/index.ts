import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const { paymentIntentId } = await req.json();

      if (!paymentIntentId) {
        return new Response(
          JSON.stringify({ error: 'Payment Intent ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single();

      if (paymentError || !payment) {
        return new Response(
          JSON.stringify({ error: 'Payment record not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let paymentStatus = 'pending';
      let errorMessage = null;

      switch (paymentIntent.status) {
        case 'succeeded':
          paymentStatus = 'succeeded';
          break;
        case 'processing':
          paymentStatus = 'processing';
          break;
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
          paymentStatus = 'pending';
          break;
        case 'canceled':
          paymentStatus = 'cancelled';
          break;
        default:
          paymentStatus = 'failed';
          errorMessage = paymentIntent.last_payment_error?.message;
      }

      const paymentMethod = paymentIntent.payment_method 
        ? await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string)
        : null;

      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          status: paymentStatus,
          stripe_charge_id: paymentIntent.latest_charge as string,
          payment_method_type: paymentMethod?.type,
          card_brand: paymentMethod?.card?.brand,
          card_last_four: paymentMethod?.card?.last4,
          error_message: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Payment update error:', updateError);
      }

      const { data: updatedPayment } = await supabaseClient
        .from('payments')
        .select('*, invoice:invoices(*)')
        .eq('id', payment.id)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          payment: updatedPayment,
          paymentIntent: {
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
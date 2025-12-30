import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

// Add this block - Declare Deno global type
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno?.env?.get('SUPABASE_URL') ?? '',
      Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req?.method === 'POST') {
      const { invoiceId, customerInfo } = await req?.json();

      if (!invoiceId) {
        return new Response(
          JSON.stringify({ error: 'Invoice ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!customerInfo?.email) {
        return new Response(
          JSON.stringify({ error: 'Customer email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const authHeader = req?.headers?.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: { user }, error: authError } = await supabaseClient?.auth?.getUser(
        authHeader?.replace('Bearer ', '')
      );

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: invoice, error: invoiceError } = await supabaseClient?.from('invoices')?.select('*, client:clients(*)')?.eq('id', invoiceId)?.eq('user_id', user?.id)?.single();

      if (invoiceError || !invoice) {
        return new Response(
          JSON.stringify({ error: 'Invoice not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (invoice?.payment_status === 'succeeded') {
        return new Response(
          JSON.stringify({ error: 'Invoice already paid' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: userProfile } = await supabaseClient?.from('user_profiles')?.select('stripe_customer_id')?.eq('id', user?.id)?.single();

      let stripeCustomer;
      const customerData = {
        name: customerInfo?.name || `${invoice?.client?.first_name || ''} ${invoice?.client?.last_name || ''}`?.trim(),
        email: customerInfo?.email,
        phone: customerInfo?.phone || invoice?.client?.phone,
        address: {
          line1: customerInfo?.billing?.address || invoice?.client?.address,
          city: customerInfo?.billing?.city || invoice?.client?.city,
          postal_code: customerInfo?.billing?.postal_code || invoice?.client?.postal_code,
          country: customerInfo?.billing?.country || invoice?.client?.country || 'FR'
        }
      };

      if (userProfile?.stripe_customer_id) {
        stripeCustomer = await stripe?.customers?.update(userProfile?.stripe_customer_id, customerData);
      } else {
        stripeCustomer = await stripe?.customers?.create(customerData);
        
        await supabaseClient?.from('user_profiles')?.update({ stripe_customer_id: stripeCustomer?.id })?.eq('id', user?.id);
      }

      const amountInCents = Math.round(invoice?.total_amount * 100);

      const paymentIntent = await stripe?.paymentIntents?.create({
        amount: amountInCents,
        currency: invoice?.currency?.toLowerCase() || 'eur',
        customer: stripeCustomer?.id,
        description: `Payment for Invoice ${invoice?.invoice_number}`,
        metadata: {
          invoice_id: invoice?.id,
          invoice_number: invoice?.invoice_number,
          user_id: user?.id,
          customer_email: customerInfo?.email
        }
      });

      const { data: payment, error: paymentError } = await supabaseClient?.from('payments')?.insert({
          user_id: user?.id,
          invoice_id: invoice?.id,
          payment_intent_id: paymentIntent?.id,
          amount: invoice?.total_amount,
          currency: invoice?.currency || 'EUR',
          status: 'pending',
          customer_email: customerInfo?.email,
          customer_name: customerData?.name,
          billing_address: customerData?.address,
          metadata: {
            invoice_number: invoice?.invoice_number,
            client_name: invoice?.client?.company_name || `${invoice?.client?.first_name || ''} ${invoice?.client?.last_name || ''}`?.trim()
          }
        })?.select()?.single();

      if (paymentError) {
        console.error('Payment record creation error:', paymentError);
      }

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          invoiceNumber: invoice.invoice_number,
          amount: amountInCents,
          currency: paymentIntent.currency,
          paymentId: payment?.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
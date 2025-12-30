import { supabase } from '../lib/supabase';

export const paymentService = {
  async createPaymentIntent(invoiceId, customerInfo) {
    try {
      const { data: { session } } = await supabase?.auth?.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase?.functions?.invoke('create-payment-intent', {
        body: {
          invoiceId,
          customerInfo
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw error;
    }
  },

  async confirmPayment(paymentIntentId) {
    try {
      const { data, error } = await supabase?.functions?.invoke('confirm-payment', {
        body: { paymentIntentId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Confirm payment error:', error);
      throw error;
    }
  },

  async getInvoiceDetails(invoiceId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('invoices')?.select(`
          *,
          client:clients(*)
        `)?.eq('id', invoiceId)?.eq('user_id', user?.id)?.single();

      if (error) throw error;

      return {
        id: data?.id,
        invoiceNumber: data?.invoice_number,
        totalAmount: data?.total_amount,
        subtotal: data?.subtotal,
        taxAmount: data?.tax_amount,
        currency: data?.currency,
        status: data?.status,
        paymentStatus: data?.payment_status,
        dueDate: data?.due_date,
        issueDate: data?.issue_date,
        description: data?.description,
        client: data?.client ? {
          companyName: data?.client?.company_name,
          firstName: data?.client?.first_name,
          lastName: data?.client?.last_name,
          email: data?.client?.email,
          phone: data?.client?.phone,
          address: data?.client?.address,
          city: data?.client?.city,
          postalCode: data?.client?.postal_code,
          country: data?.client?.country
        } : null
      };
    } catch (error) {
      console.error('Get invoice details error:', error);
      throw error;
    }
  },

  formatAmount(amount, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    })?.format(amount);
  },

  formatAmountCents(amountCents, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    })?.format(amountCents / 100);
  }
};
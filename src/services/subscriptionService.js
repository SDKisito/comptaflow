import { supabase } from '../lib/supabase';

/**
 * Service for managing subscription plans and user subscriptions
 * Handles snake_case to camelCase conversion
 */
export const subscriptionService = {
  /**
   * Get all active subscription plans
   * @returns {Promise<Array>} Array of subscription plans
   */
  async getAllPlans() {
    const { data, error } = await supabase?.from('subscription_plans')?.select('*')?.eq('is_active', true)?.order('display_order', { ascending: true });

    if (error) throw error;

    return data?.map(plan => ({
      id: plan?.id,
      planName: plan?.plan_name,
      planCode: plan?.plan_code,
      priceMonthly: plan?.price_monthly,
      priceAnnual: plan?.price_annual,
      currency: plan?.currency,
      maxClients: plan?.max_clients,
      maxInvoicesPerMonth: plan?.max_invoices_per_month,
      maxDocumentsStorageGb: plan?.max_documents_storage_gb,
      features: plan?.features,
      isActive: plan?.is_active,
      displayOrder: plan?.display_order,
      createdAt: plan?.created_at,
      updatedAt: plan?.updated_at
    })) || [];
  },

  /**
   * Get user's current subscription
   * @returns {Promise<Object|null>} User's subscription with plan details or null
   */
  async getCurrentSubscription() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('user_subscriptions')?.select(`
        *,
        plan:subscription_plans(*)
      `)?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.limit(1)?.single();

    if (error) {
      if (error?.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    return {
      id: data?.id,
      userId: data?.user_id,
      planId: data?.plan_id,
      billingCycle: data?.billing_cycle,
      subscriptionStartDate: data?.subscription_start_date,
      subscriptionEndDate: data?.subscription_end_date,
      autoRenew: data?.auto_renew,
      paymentMethod: data?.payment_method,
      lastPaymentDate: data?.last_payment_date,
      nextPaymentDate: data?.next_payment_date,
      plan: data?.plan ? {
        id: data?.plan?.id,
        planName: data?.plan?.plan_name,
        planCode: data?.plan?.plan_code,
        priceMonthly: data?.plan?.price_monthly,
        priceAnnual: data?.plan?.price_annual,
        currency: data?.plan?.currency,
        maxClients: data?.plan?.max_clients,
        maxInvoicesPerMonth: data?.plan?.max_invoices_per_month,
        features: data?.plan?.features
      } : null
    };
  },

  /**
   * Subscribe to a plan
   * @param {string} planId - Plan ID to subscribe to
   * @param {string} billingCycle - 'monthly' or 'annual'
   * @returns {Promise<Object>} Created subscription
   */
  async subscribeToPlan(planId, billingCycle = 'monthly') {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const subscriptionEndDate = billingCycle === 'monthly'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase?.from('user_subscriptions')?.insert({
        user_id: user?.id,
        plan_id: planId,
        billing_cycle: billingCycle,
        subscription_start_date: new Date()?.toISOString(),
        subscription_end_date: subscriptionEndDate?.toISOString(),
        auto_renew: true
      })?.select()?.single();

    if (error) throw error;

    return {
      id: data?.id,
      userId: data?.user_id,
      planId: data?.plan_id,
      billingCycle: data?.billing_cycle,
      subscriptionStartDate: data?.subscription_start_date,
      subscriptionEndDate: data?.subscription_end_date
    };
  },

  /**
   * Update subscription billing cycle
   * @param {string} subscriptionId - Subscription ID
   * @param {string} newBillingCycle - 'monthly' or 'annual'
   * @returns {Promise<Object>} Updated subscription
   */
  async updateBillingCycle(subscriptionId, newBillingCycle) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('user_subscriptions')?.update({
        billing_cycle: newBillingCycle,
        updated_at: new Date()?.toISOString()
      })?.eq('id', subscriptionId)?.eq('user_id', user?.id)?.select()?.single();

    if (error) throw error;

    return {
      id: data?.id,
      billingCycle: data?.billing_cycle,
      updatedAt: data?.updated_at
    };
  },

  /**
   * Cancel subscription (set auto_renew to false)
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Updated subscription
   */
  async cancelSubscription(subscriptionId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('user_subscriptions')?.update({
        auto_renew: false,
        updated_at: new Date()?.toISOString()
      })?.eq('id', subscriptionId)?.eq('user_id', user?.id)?.select()?.single();

    if (error) throw error;

    return {
      id: data?.id,
      autoRenew: data?.auto_renew,
      subscriptionEndDate: data?.subscription_end_date
    };
  }
};
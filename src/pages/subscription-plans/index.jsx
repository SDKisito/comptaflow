import React, { useState, useEffect } from 'react';
import { Check, X, ChevronRight, Loader2 } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { trackSubscription } from '../../utils/analytics';

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    // Track page view
    trackSubscription?.viewPlans();
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService?.getAllPlans(),
        subscriptionService?.getCurrentSubscription()
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
      
      if (subscriptionData?.billingCycle) {
        setBillingCycle(subscriptionData?.billingCycle);
      }
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err?.message || 'Erreur lors du chargement des forfaits');
    } finally {
      setLoading(false);
    }
  };

  const handleBillingToggle = (cycle) => {
    setBillingCycle(cycle);
    trackSubscription?.toggleBilling(cycle);
  };

  const handlePlanSelect = (plan) => {
    const price = billingCycle === 'monthly' ? plan?.monthly_price : plan?.annual_price;
    trackSubscription?.selectPlan(plan?.name, billingCycle, price);
    
    // ... existing plan selection logic ...
  };

  const handleSubscribe = async (plan) => {
    try {
      const price = billingCycle === 'monthly' ? plan?.monthly_price : plan?.annual_price;
      
      // Track conversion
      trackSubscription?.subscribe(plan?.name, billingCycle, price);
      
      await subscriptionService?.subscribeToPlan(plan?.id, billingCycle);
      await fetchSubscriptionPlans();
      
      alert('Abonnement créé avec succès !');
    } catch (err) {
      console.error('Error subscribing:', err);
      setError(err?.message || 'Erreur lors de la souscription');
    } finally {
      setSubscribing(null);
    }
  };

  const calculateAnnualSavings = (monthly, annual) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - annual;
    const percentage = ((savings / monthlyCost) * 100)?.toFixed(0);
    return { savings, percentage };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(price);
  };

  const isCurrentPlan = (planId) => {
    return currentSubscription?.planId === planId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des forfaits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre forfait ComptaFlow
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Solutions adaptées aux besoins des TPE et PME françaises
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleBillingToggle('monthly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => handleBillingToggle('annual')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Annuel
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans?.map((plan) => {
            const price = billingCycle === 'monthly' ? plan?.monthly_price : plan?.annual_price;
            const { savings, percentage } = calculateAnnualSavings(
              plan?.monthly_price,
              plan?.annual_price
            );
            const isPro = plan?.planCode === 'pro';
            const isCurrent = isCurrentPlan(plan?.id);
            const isSubscribing = subscribing === plan?.id;

            return (
              <div
                key={plan?.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  isPro ? 'ring-2 ring-blue-600 transform md:scale-105' : ''
                } ${isCurrent ? 'ring-2 ring-green-600' : ''}`}
              >
                {/* Popular Badge */}
                {isPro && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                    POPULAIRE
                  </div>
                )}
                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-green-600 text-white px-4 py-1 text-xs font-bold rounded-br-lg">
                    FORFAIT ACTUEL
                  </div>
                )}
                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan?.planName}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-extrabold text-gray-900">
                        {formatPrice(price)}
                      </span>
                      <span className="ml-2 text-gray-600">
                        /{billingCycle === 'monthly' ? 'mois' : 'an'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="mt-2 text-sm text-green-600 font-medium">
                        Économisez {formatPrice(savings)} par an ({percentage}%)
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      <span>
                        {plan?.maxClients === -1
                          ? 'Clients illimités' : `Jusqu'à ${plan?.maxClients} clients`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      <span>
                        {plan?.maxInvoicesPerMonth === -1
                          ? 'Factures illimitées'
                          : `${plan?.maxInvoicesPerMonth} factures/mois`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      <span>{plan?.maxDocumentsStorageGb} Go de stockage</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan?.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => !isCurrent && handleSubscribe(plan)}
                    disabled={isCurrent || isSubscribing}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : isPro
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } ${isSubscribing ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {isSubscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Souscription...
                      </>
                    ) : isCurrent ? (
                      'Forfait actuel'
                    ) : (
                      <>
                        Choisir ce plan
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comparaison détaillée des fonctionnalités
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">
                      Fonctionnalité
                    </th>
                    {plans?.map((plan) => (
                      <th
                        key={plan?.id}
                        className="text-center py-4 px-4 text-sm font-semibold text-gray-900"
                      >
                        {plan?.planName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Clients */}
                  <tr>
                    <td className="py-4 px-4 text-sm text-gray-700">Nombre de clients</td>
                    {plans?.map((plan) => (
                      <td key={plan?.id} className="text-center py-4 px-4 text-sm text-gray-900">
                        {plan?.maxClients === -1 ? 'Illimité' : plan?.maxClients}
                      </td>
                    ))}
                  </tr>
                  {/* Invoices */}
                  <tr>
                    <td className="py-4 px-4 text-sm text-gray-700">Factures par mois</td>
                    {plans?.map((plan) => (
                      <td key={plan?.id} className="text-center py-4 px-4 text-sm text-gray-900">
                        {plan?.maxInvoicesPerMonth === -1
                          ? 'Illimité'
                          : plan?.maxInvoicesPerMonth}
                      </td>
                    ))}
                  </tr>
                  {/* Storage */}
                  <tr>
                    <td className="py-4 px-4 text-sm text-gray-700">Stockage</td>
                    {plans?.map((plan) => (
                      <td key={plan?.id} className="text-center py-4 px-4 text-sm text-gray-900">
                        {plan?.maxDocumentsStorageGb} Go
                      </td>
                    ))}
                  </tr>
                  {/* TVA Management */}
                  <tr>
                    <td className="py-4 px-4 text-sm text-gray-700">Gestion TVA</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-sm text-gray-600">Standard</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-sm text-gray-900 font-medium">Avancée</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-sm text-gray-900 font-bold">Complète</span>
                    </td>
                  </tr>
                  {/* Support */}
                  <tr>
                    <td className="py-4 px-4 text-sm text-gray-700">Support</td>
                    <td className="text-center py-4 px-4 text-sm text-gray-600">Email</td>
                    <td className="text-center py-4 px-4 text-sm text-gray-900 font-medium">
                      Prioritaire
                    </td>
                    <td className="text-center py-4 px-4 text-sm text-gray-900 font-bold">
                      Dédié
                    </td>
                  </tr>
                  {/* API Access */}
                  <tr>
                    <td className="py-4 px-4 text-sm text-gray-700">Accès API</td>
                    <td className="text-center py-4 px-4">
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  {/* Multi-users */}
                  <tr>
                    <td className="py-4 px-4 text-sm text-gray-700">Multi-utilisateurs</td>
                    <td className="text-center py-4 px-4">
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-4">Moyens de paiement acceptés</p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Carte Bancaire</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">SEPA</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Virement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { StripeProvider } from '../../contexts/StripeContext';
import { paymentService } from '../../services/paymentService';
import StripePaymentForm from './components/StripePaymentForm';
import InvoiceDetails from './components/InvoiceDetails';
import AppIcon from '../../components/AppIcon';

export default function PaymentProcessing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams?.get('invoiceId');

  const [invoice, setInvoice] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!invoiceId) {
      setError('ID de facture manquant');
      setLoading(false);
      return;
    }

    loadInvoiceAndInitializePayment();
  }, [invoiceId]);

  const loadInvoiceAndInitializePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const invoiceData = await paymentService?.getInvoiceDetails(invoiceId);
      
      if (invoiceData?.paymentStatus === 'succeeded') {
        setError('Cette facture a déjà été payée');
        setLoading(false);
        return;
      }

      setInvoice(invoiceData);

      const customerInfo = {
        email: invoiceData?.client?.email || '',
        name: invoiceData?.client?.companyName || 
          `${invoiceData?.client?.firstName || ''} ${invoiceData?.client?.lastName || ''}`?.trim(),
        phone: invoiceData?.client?.phone || '',
        billing: {
          address: invoiceData?.client?.address || '',
          city: invoiceData?.client?.city || '',
          postalCode: invoiceData?.client?.postalCode || '',
          country: invoiceData?.client?.country || 'FR'
        }
      };

      const paymentIntentData = await paymentService?.createPaymentIntent(
        invoiceId,
        customerInfo
      );

      setClientSecret(paymentIntentData?.clientSecret);
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err?.message || 'Échec du chargement des détails de paiement');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    navigate(`/invoice-management?paymentSuccess=true&invoiceId=${invoiceId}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  if (loading) {
    return (
      <StripeProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Helmet>
            <title>Chargement du paiement - Facturation</title>
          </Helmet>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto">
              <AppIcon name="Loader2" size={64} className="animate-spin text-blue-600" />
            </div>
            <p className="text-gray-600">Chargement des informations de paiement...</p>
          </div>
        </div>
      </StripeProvider>
    );
  }

  if (error) {
    return (
      <StripeProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Helmet>
            <title>Erreur de paiement - Facturation</title>
          </Helmet>
          <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <AppIcon name="AlertCircle" size={24} className="text-red-600" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de paiement</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <button
              onClick={() => navigate('/invoice-management')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour aux factures
            </button>
          </div>
        </div>
      </StripeProvider>
    );
  }

  return (
    <StripeProvider>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <Helmet>
          <title>Traitement du paiement - Facturation</title>
          <meta name="description" content="Paiement sécurisé de facture avec Stripe" />
        </Helmet>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/invoice-management')}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <AppIcon name="ArrowLeft" size={20} className="mr-2" />
              Retour aux factures
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Paiement sécurisé
            </h1>
            <p className="text-gray-600 mt-2">
              Complétez votre paiement en toute sécurité via Stripe
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Invoice Details */}
            <div>
              <InvoiceDetails invoice={invoice} />
            </div>

            {/* Payment Form */}
            <div className="lg:sticky lg:top-8 h-fit">
              <StripePaymentForm
                clientSecret={clientSecret}
                amount={invoice ? Math.round(invoice?.totalAmount * 100) : 0}
                currency={invoice?.currency || 'EUR'}
                invoiceData={{
                  invoiceId: invoice?.id,
                  invoiceNumber: invoice?.invoiceNumber
                }}
                customerInfo={{
                  email: invoice?.client?.email,
                  firstName: invoice?.client?.firstName,
                  lastName: invoice?.client?.lastName,
                  phone: invoice?.client?.phone,
                  billing: {
                    address: invoice?.client?.address,
                    city: invoice?.client?.city,
                    postalCode: invoice?.client?.postalCode,
                    country: invoice?.client?.country
                  }
                }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                confirmButtonText="Finaliser le paiement"
              />

              {/* Security Notice */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <AppIcon name="Shield" size={20} className="text-blue-600 mr-3 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Paiement 100% sécurisé</p>
                    <p className="text-blue-700">
                      Vos informations de paiement sont cryptées et ne sont jamais stockées sur nos serveurs. 
                      Nous utilisons Stripe, une plateforme de paiement certifiée PCI DSS niveau 1.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StripeProvider>
  );
}
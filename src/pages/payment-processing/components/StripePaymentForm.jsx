import React, { useState, useEffect } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement,
  Elements 
} from '@stripe/react-stripe-js';
import { useStripeContext } from '../../../contexts/StripeContext';
import { paymentService } from '../../../services/paymentService';
import AppIcon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StripePaymentFormInner = ({
  clientSecret,
  amount,
  currency = 'EUR',
  invoiceData,
  customerInfo,
  onSuccess,
  onError,
  confirmButtonText = 'Finaliser le paiement',
  className = ''
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentReady, setPaymentReady] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    setErrorMessage('');
    setPaymentReady(false);
  }, [clientSecret]);

  useEffect(() => {
    if (elements) {
      const paymentElement = elements?.getElement(PaymentElement);
      if (paymentElement) {
        paymentElement?.on('ready', () => {
          setPaymentReady(true);
        });
      }
    }
  }, [elements]);

  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Système de paiement non prêt. Veuillez réessayer.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { invoiceId, invoiceNumber } = invoiceData || {};

      const { error: stripeError, paymentIntent } = await stripe?.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location?.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        setErrorMessage(stripeError?.message || 'Échec du paiement. Veuillez réessayer.');
        onError?.(stripeError);
      } else if (paymentIntent) {
        if (paymentIntent?.status === 'succeeded') {
          const { data, error } = await paymentService?.confirmPayment(paymentIntent?.id);
          
          const successResult = {
            paymentIntent,
            invoiceId,
            invoiceNumber,
            paymentData: data,
            warning: error ? 'Paiement traité mais confirmation échouée. Veuillez contacter le support si nécessaire.' : undefined
          };

          setSuccessData(successResult);
          setShowSuccessAnimation(true);

          setTimeout(() => {
            setShowSuccessAnimation(false);
            onSuccess?.(successResult);
          }, 3000);
        } else if (paymentIntent?.status === 'requires_action') {
          setErrorMessage('Authentification supplémentaire requise. Veuillez compléter la vérification.');
        } else {
          setErrorMessage('Traitement du paiement incomplet. Veuillez réessayer.');
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setErrorMessage('Une erreur inattendue s\'est produite. Veuillez réessayer.');
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!stripe || !elements || !clientSecret) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Chargement du système de paiement sécurisé...
        </p>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Informations de paiement
            </label>
            <PaymentElement 
              options={{
                fields: {
                  billingDetails: 'auto'
                },
                layout: 'tabs'
              }}
            />
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AppIcon name="AlertCircle" size={20} className="text-red-600 mr-3 mt-0.5" />
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={!paymentReady || isProcessing || !stripe || !elements}
          className="w-full"
          size="lg"
          iconName={isProcessing ? "Loader2" : "CreditCard"}
          iconClassName={isProcessing ? "animate-spin" : ""}
          iconPosition="left"
        >
          {isProcessing ? 'Traitement en cours...' : confirmButtonText}
        </Button>

        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <AppIcon name="Shield" size={14} />
          <span>Sécurisé par Stripe • Vos informations sont cryptées</span>
        </div>
      </form>
      {showSuccessAnimation && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-50">
          <div className="text-center space-y-6 p-8">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <AppIcon name="Check" size={32} className="text-white animate-pulse" />
                </div>
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-300 rounded-full animate-ping opacity-30"></div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-green-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-600 animate-fade-in">
                Paiement réussi ! 🎉
              </h3>
              <p className="text-green-700 font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Votre paiement a été confirmé
              </p>
              {successData?.invoiceNumber && (
                <p className="text-sm text-green-600 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  Facture #{successData?.invoiceNumber}
                </p>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-4 animate-fade-in" style={{ animationDelay: '0.9s' }}>
              <p className="text-lg font-semibold text-green-800">
                {paymentService?.formatAmountCents(amount, currency)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Traitement de votre facture...
              </p>
            </div>

            <div className="flex justify-center space-x-1 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StripePaymentForm = (props) => {
  const { stripePromise, stripeOptions } = useStripeContext();

  if (!props?.clientSecret) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-center text-gray-500">
          Préparation du système de paiement...
        </p>
      </div>
    );
  }

  const elementsOptions = {
    clientSecret: props?.clientSecret,
    ...stripeOptions,
    defaultValues: props?.customerInfo ? {
      billingDetails: {
        name: `${props?.customerInfo?.firstName || ''} ${props?.customerInfo?.lastName || ''}`?.trim(),
        email: props?.customerInfo?.email || '',
        phone: props?.customerInfo?.phone || '',
        address: {
          line1: props?.customerInfo?.billing?.address || '',
          city: props?.customerInfo?.billing?.city || '',
          postal_code: props?.customerInfo?.billing?.postalCode || '',
          country: props?.customerInfo?.billing?.country || 'FR',
        }
      }
    } : undefined
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <StripePaymentFormInner {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
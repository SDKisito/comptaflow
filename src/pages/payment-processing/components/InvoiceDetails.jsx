import React from 'react';
import AppIcon from '../../../components/AppIcon';
import { paymentService } from '../../../services/paymentService';

export default function InvoiceDetails({ invoice }) {
  if (!invoice) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const clientName = invoice?.client?.companyName || 
    `${invoice?.client?.firstName || ''} ${invoice?.client?.lastName || ''}`?.trim() || 
    'N/A';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Invoice Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Facture #{invoice?.invoiceNumber}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Émise le {new Date(invoice.issueDate)?.toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {invoice?.paymentStatus === 'succeeded' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <AppIcon name="CheckCircle" size={16} className="mr-1" />
              Payée
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <AppIcon name="Clock" size={16} className="mr-1" />
              En attente
            </span>
          )}
        </div>
      </div>
      {/* Client Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Informations Client
        </h3>
        <div className="space-y-2">
          <div className="flex items-center text-gray-900">
            <AppIcon name="User" size={16} className="mr-2 text-gray-400" />
            <span className="font-medium">{clientName}</span>
          </div>
          {invoice?.client?.email && (
            <div className="flex items-center text-gray-600">
              <AppIcon name="Mail" size={16} className="mr-2 text-gray-400" />
              <span>{invoice?.client?.email}</span>
            </div>
          )}
          {invoice?.client?.phone && (
            <div className="flex items-center text-gray-600">
              <AppIcon name="Phone" size={16} className="mr-2 text-gray-400" />
              <span>{invoice?.client?.phone}</span>
            </div>
          )}
          {invoice?.client?.address && (
            <div className="flex items-start text-gray-600">
              <AppIcon name="MapPin" size={16} className="mr-2 text-gray-400 mt-0.5" />
              <div>
                <p>{invoice?.client?.address}</p>
                <p>{invoice?.client?.postalCode} {invoice?.client?.city}</p>
                <p>{invoice?.client?.country}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Invoice Details */}
      {invoice?.description && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Description
          </h3>
          <p className="text-gray-600">{invoice?.description}</p>
        </div>
      )}
      {/* Amount Breakdown */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-gray-600">
          <span>Sous-total</span>
          <span className="font-medium">{paymentService?.formatAmount(invoice?.subtotal, invoice?.currency)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>TVA</span>
          <span className="font-medium">{paymentService?.formatAmount(invoice?.taxAmount, invoice?.currency)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
          <span>Total à payer</span>
          <span className="text-blue-600">{paymentService?.formatAmount(invoice?.totalAmount, invoice?.currency)}</span>
        </div>
      </div>
      {/* Due Date */}
      {invoice?.dueDate && (
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
          <div className="flex items-center text-blue-900">
            <AppIcon name="Calendar" size={20} className="mr-2" />
            <span className="font-medium">Date d'échéance</span>
          </div>
          <span className="text-blue-900 font-semibold">
            {new Date(invoice.dueDate)?.toLocaleDateString('fr-FR')}
          </span>
        </div>
      )}
    </div>
  );
}
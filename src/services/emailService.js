import { supabase } from '../lib/supabase';

/**
 * Email service for sending automated emails via Resend
 * Supports invoice notifications, payment reminders, and tax deadline alerts
 * All emails use French templates with compliance formatting
 */
export const emailService = {
  /**
   * Send invoice email to customer
   * @param {Object} params - Invoice email parameters
   * @param {string} params.to - Recipient email address
   * @param {string} params.clientName - Client name
   * @param {string} params.invoiceNumber - Invoice number (e.g., "FAC-2024-001")
   * @param {string} params.issueDate - Invoice issue date (ISO string)
   * @param {string} params.dueDate - Payment due date (ISO string)
   * @param {number} params.totalAmount - Total amount in euros
   * @param {string} params.downloadUrl - Optional PDF download URL
   * @returns {Promise<Object>} Email send result
   */
  async sendInvoiceEmail({ to, clientName, invoiceNumber, issueDate, dueDate, totalAmount, downloadUrl }) {
    try {
      const { data, error } = await supabase?.functions?.invoke('send-email', {
        body: {
          emailType: 'invoice',
          to,
          data: {
            clientName,
            invoiceNumber,
            issueDate,
            dueDate,
            totalAmount,
            downloadUrl
          }
        }
      });

      if (error) throw error;

      return {
        success: true,
        messageId: data?.messageId,
        message: 'Facture envoyée avec succès'
      };
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw new Error(`Erreur lors de l'envoi de la facture: ${error?.message}`);
    }
  },

  /**
   * Send payment reminder email to customer
   * @param {Object} params - Payment reminder parameters
   * @param {string} params.to - Recipient email address
   * @param {string} params.clientName - Client name
   * @param {string} params.invoiceNumber - Invoice number
   * @param {number} params.amountDue - Amount due in euros
   * @param {string} params.dueDate - Payment due date (ISO string)
   * @param {boolean} params.isOverdue - Whether payment is overdue
   * @param {number} params.daysOverdue - Days overdue (if applicable)
   * @param {string} params.paymentUrl - Optional payment link
   * @returns {Promise<Object>} Email send result
   */
  async sendPaymentReminder({ to, clientName, invoiceNumber, amountDue, dueDate, isOverdue = false, daysOverdue = 0, paymentUrl }) {
    try {
      const { data, error } = await supabase?.functions?.invoke('send-email', {
        body: {
          emailType: 'payment_reminder',
          to,
          data: {
            clientName,
            invoiceNumber,
            amountDue,
            dueDate,
            isOverdue,
            daysOverdue,
            paymentUrl
          }
        }
      });

      if (error) throw error;

      return {
        success: true,
        messageId: data?.messageId,
        message: 'Rappel de paiement envoyé avec succès'
      };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw new Error(`Erreur lors de l'envoi du rappel: ${error?.message}`);
    }
  },

  /**
   * Send tax deadline alert email
   * @param {Object} params - Tax deadline alert parameters
   * @param {string} params.to - Recipient email address
   * @param {string} params.userName - User name
   * @param {string} params.declarationType - Type of tax declaration (e.g., "TVA trimestrielle")
   * @param {string} params.deadline - Deadline date (ISO string)
   * @param {number} params.daysRemaining - Days remaining until deadline
   * @param {string} params.taxAuthority - Tax authority name
   * @param {Array<string>} params.requiredDocuments - List of required documents
   * @param {string} params.declarationUrl - Optional link to prepare declaration
   * @returns {Promise<Object>} Email send result
   */
  async sendTaxDeadlineAlert({ to, userName, declarationType, deadline, daysRemaining, taxAuthority, requiredDocuments, declarationUrl }) {
    try {
      const { data, error } = await supabase?.functions?.invoke('send-email', {
        body: {
          emailType: 'tax_deadline',
          to,
          data: {
            userName,
            declarationType,
            deadline,
            daysRemaining,
            taxAuthority,
            requiredDocuments,
            declarationUrl
          }
        }
      });

      if (error) throw error;

      return {
        success: true,
        messageId: data?.messageId,
        message: 'Alerte fiscale envoyée avec succès'
      };
    } catch (error) {
      console.error('Error sending tax deadline alert:', error);
      throw new Error(`Erreur lors de l'envoi de l'alerte fiscale: ${error?.message}`);
    }
  },

  /**
   * Send bulk invoice emails (batch processing)
   * @param {Array<Object>} invoices - Array of invoice email parameters
   * @returns {Promise<Object>} Batch send results
   */
  async sendBulkInvoices(invoices) {
    const results = {
      success: [],
      failed: []
    };

    for (const invoice of invoices) {
      try {
        const result = await this.sendInvoiceEmail(invoice);
        results?.success?.push({ invoiceNumber: invoice?.invoiceNumber, ...result });
      } catch (error) {
        results?.failed?.push({
          invoiceNumber: invoice?.invoiceNumber,
          error: error?.message
        });
      }
    }

    return {
      total: invoices?.length,
      succeeded: results?.success?.length,
      failed: results?.failed?.length,
      details: results
    };
  },

  /**
   * Send bulk payment reminders (batch processing)
   * @param {Array<Object>} reminders - Array of payment reminder parameters
   * @returns {Promise<Object>} Batch send results
   */
  async sendBulkPaymentReminders(reminders) {
    const results = {
      success: [],
      failed: []
    };

    for (const reminder of reminders) {
      try {
        const result = await this.sendPaymentReminder(reminder);
        results?.success?.push({ invoiceNumber: reminder?.invoiceNumber, ...result });
      } catch (error) {
        results?.failed?.push({
          invoiceNumber: reminder?.invoiceNumber,
          error: error?.message
        });
      }
    }

    return {
      total: reminders?.length,
      succeeded: results?.success?.length,
      failed: results?.failed?.length,
      details: results
    };
  }
};
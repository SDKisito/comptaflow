import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  // ✅ CORS preflight
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    const { emailType, to, data } = await req?.json();
    
    const Deno = globalThis.Deno;
    const RESEND_API_KEY = Deno?.env?.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // French email templates
    const templates = {
      invoice: {
        subject: (invoiceNumber) => `Facture ${invoiceNumber} - ComptaFlow`,
        html: (data) => `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #f9fafb; }
              .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ComptaFlow</h1>
                <p>Votre facture est prête</p>
              </div>
              <div class="content">
                <p>Bonjour ${data?.clientName},</p>
                <p>Veuillez trouver ci-joint votre facture ${data?.invoiceNumber} du ${new Date(data.issueDate)?.toLocaleDateString('fr-FR')}.</p>
                
                <div class="invoice-details">
                  <h2>Détails de la facture</h2>
                  <p><strong>Numéro:</strong> ${data?.invoiceNumber}</p>
                  <p><strong>Date d'émission:</strong> ${new Date(data.issueDate)?.toLocaleDateString('fr-FR')}</p>
                  <p><strong>Date d'échéance:</strong> ${new Date(data.dueDate)?.toLocaleDateString('fr-FR')}</p>
                  <p class="amount">Montant total: ${data?.totalAmount}€ TTC</p>
                </div>

                <p><strong>Informations de conformité:</strong></p>
                <ul>
                  <li>TVA française applicable</li>
                  <li>Conforme aux normes comptables françaises</li>
                  <li>Facture électronique certifiée</li>
                </ul>

                <p>Vous pouvez télécharger votre facture au format PDF en cliquant sur le bouton ci-dessous:</p>
                <a href="${data?.downloadUrl || '#'}" class="button">Télécharger la facture PDF</a>

                <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
              </div>
              <div class="footer">
                <p>© ${new Date()?.getFullYear()} ComptaFlow - Solution de comptabilité française</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
          </html>
        `
      },
      payment_reminder: {
        subject: (invoiceNumber) => `Rappel de paiement - Facture ${invoiceNumber}`,
        html: (data) => `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #fffbeb; }
              .reminder-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; border-radius: 8px; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .urgent { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Rappel de paiement</h1>
              </div>
              <div class="content">
                <p>Bonjour ${data?.clientName},</p>
                <p>Nous vous rappelons que le paiement de la facture ${data?.invoiceNumber} est ${data?.isOverdue ? '<span class="urgent">en retard</span>' : 'bientôt dû'}.</p>
                
                <div class="reminder-box">
                  <h2>Informations de paiement</h2>
                  <p><strong>Facture:</strong> ${data?.invoiceNumber}</p>
                  <p><strong>Montant dû:</strong> ${data?.amountDue}€ TTC</p>
                  <p><strong>Date d'échéance:</strong> ${new Date(data.dueDate)?.toLocaleDateString('fr-FR')}</p>
                  ${data?.isOverdue ? `<p class="urgent">Retard: ${data?.daysOverdue} jour(s)</p>` : ''}
                </div>

                <p>Nous vous invitons à régulariser votre situation dans les plus brefs délais pour éviter tout frais supplémentaire.</p>

                <a href="${data?.paymentUrl || '#'}" class="button">Effectuer le paiement</a>

                <p><strong>Moyens de paiement acceptés:</strong></p>
                <ul>
                  <li>Virement bancaire</li>
                  <li>Carte bancaire</li>
                  <li>Prélèvement SEPA</li>
                </ul>

                <p>Si vous avez déjà effectué ce paiement, veuillez ignorer ce rappel.</p>
              </div>
              <div class="footer">
                <p>© ${new Date()?.getFullYear()} ComptaFlow - Solution de comptabilité française</p>
                <p>Pour toute question: contact@comptaflow.fr</p>
              </div>
            </div>
          </body>
          </html>
        `
      },
      tax_deadline: {
        subject: () => `⚠️ Rappel d'échéance fiscale - ComptaFlow`,
        html: (data) => `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: #fef2f2; }
              .deadline-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626; border-radius: 8px; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .countdown { font-size: 36px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Échéance fiscale imminente</h1>
              </div>
              <div class="content">
                <p>Bonjour ${data?.userName},</p>
                <p>Nous vous rappelons qu'une échéance fiscale importante approche.</p>
                
                <div class="deadline-box">
                  <h2>${data?.declarationType}</h2>
                  <p><strong>Date limite:</strong> ${new Date(data.deadline)?.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <div class="countdown">${data?.daysRemaining} jour(s) restant(s)</div>
                  <p><strong>Organisme:</strong> ${data?.taxAuthority || 'Direction Générale des Finances Publiques (DGFiP)'}</p>
                </div>

                <p><strong>Documents requis pour cette déclaration:</strong></p>
                <ul>
                  ${data?.requiredDocuments?.map(doc => `<li>${doc}</li>`)?.join('') || '<li>Relevé comptable annuel</li><li>Justificatifs de revenus</li><li>Déclarations TVA</li>'}
                </ul>

                <p><strong>Informations de conformité:</strong></p>
                <ul>
                  <li>Déclaration dématérialisée obligatoire</li>
                  <li>Format conforme aux normes DGFiP</li>
                  <li>Archivage sécurisé pendant 10 ans</li>
                </ul>

                <a href="${data?.declarationUrl || '#'}" class="button">Préparer ma déclaration</a>

                <p><strong>⚠️ Important:</strong> Le non-respect de cette échéance peut entraîner des pénalités de retard conformément au Code général des impôts.</p>

                <p>Notre équipe reste à votre disposition pour vous accompagner dans vos démarches fiscales.</p>
              </div>
              <div class="footer">
                <p>© ${new Date()?.getFullYear()} ComptaFlow - Solution de comptabilité française</p>
                <p>Conforme aux normes comptables et fiscales françaises</p>
                <p>Support: support@comptaflow.fr | Tél: +33 1 XX XX XX XX</p>
              </div>
            </div>
          </body>
          </html>
        `
      }
    };

    // Select template based on email type
    const template = templates?.[emailType];
    if (!template) {
      throw new Error(`Invalid email type: ${emailType}`);
    }

    // Prepare email content
    const subject = template?.subject(data?.invoiceNumber || data?.declarationType || 'Notification');
    const html = template?.html(data);

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: to,
        subject: subject,
        html: html
      })
    });

    if (!response?.ok) {
      const errorData = await response?.json();
      throw new Error(`Resend API error: ${errorData.message || response.statusText}`);
    }

    const result = await response?.json();

    return new Response(JSON.stringify({
      success: true,
      messageId: result.id,
      message: 'Email envoyé avec succès'
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
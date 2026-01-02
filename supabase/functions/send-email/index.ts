import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
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
    const bodyText = await req.text();
    const { emailType, to, fromName, data } = JSON.parse(bodyText);
    
    console.log('📧 From:', fromName, 'To:', to);
    
    const RESEND_API_KEY = Deno?.env?.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const templates = {
      invoice: {
        subject: (invoiceNumber: string) => `Facture ${invoiceNumber} - ComptaFlow`,
        html: (data: any) => `
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
                <p>Veuillez trouver ci-joint votre facture ${data?.invoiceNumber}.</p>
                
                <div class="invoice-details">
                  <h2>Détails de la facture</h2>
                  <p><strong>Numéro:</strong> ${data?.invoiceNumber}</p>
                  <p><strong>Date d'émission:</strong> ${data?.issueDate}</p>
                  <p><strong>Date d'échéance:</strong> ${data?.dueDate}</p>
                  <p class="amount">Montant total: ${data?.totalAmount}€ TTC</p>
                </div>

                <p>Pour toute question, n'hésitez pas à nous contacter.</p>
              </div>
              <div class="footer">
                <p>© ${new Date()?.getFullYear()} ComptaFlow</p>
              </div>
            </div>
          </body>
          </html>
        `
      }
    };

    const template = templates[emailType as keyof typeof templates];
    if (!template) {
      throw new Error(`Invalid email type: ${emailType}`);
    }

    const subject = template?.subject(data?.invoiceNumber);
    const html = template?.html(data);

    const resendPayload = {
      from: `${fromName || 'ComptaFlow'} <noreply@nando-it.fr>`,
      to: to,
      subject: subject,
      html: html
    };
    
    console.log('📮 Sending from:', resendPayload.from);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    });

    const responseText = await response.text();

    if (!response?.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      throw new Error(`Resend error: ${errorData.message || responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('✅ Email sent, ID:', result.id);

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
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
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

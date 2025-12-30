import React, { useState } from 'react';
import { Code, Zap } from 'lucide-react';
import CodeBlock from './CodeBlock';

const IntegrationExamples = () => {
  const [activeLanguage, setActiveLanguage] = useState('php');

  const examples = {
    invoiceSync: {
      title: 'Synchronisation de Factures',
      description: 'Récupérer et synchroniser les factures avec votre système',
      php: `<?php
// Configuration
$apiKey = getenv('COMPTAFLOW_API_KEY');
$baseUrl = 'https://api.comptaflow.com/api/v2';

function getInvoices($status = null, $page = 1) {
    global $apiKey, $baseUrl;
    
    $params = http_build_query([
        'page' => $page,
        'limit' => 50,
        'status' => $status
    ]);
    
    $ch = curl_init("$baseUrl/invoices?$params");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $apiKey",
        "Content-Type: application/json"
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("Erreur API: $httpCode");
    }
    
    return json_decode($response, true);
}

// Utilisation
try {
    $invoices = getInvoices('sent');
    
    foreach ($invoices['data'] as $invoice) {
        // Synchroniser avec votre base de données
        syncInvoiceToDatabase($invoice);
        
        echo "Facture {$invoice['invoice_number']} synchronisée\\n";
    }
} catch (Exception $e) {
    error_log("Erreur de synchronisation: " . $e->getMessage());
}
?>`,
      python: `import os
import requests
from typing import Optional, Dict, List

class ComptaFlowClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = 'https://api.comptaflow.com/api/v2'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_invoices(self, status: Optional[str] = None, page: int = 1) -> Dict:
        """Récupère la liste des factures"""
        params = {
            'page': page,
            'limit': 50
        }
        if status:
            params['status'] = status
        
        response = requests.get(
            f'{self.base_url}/invoices',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def sync_invoices(self, status: str = 'sent'):
        """Synchronise les factures avec le système local"""
        try:
            invoices = self.get_invoices(status=status)
            
            for invoice in invoices['data']:
                # Synchroniser avec votre base de données
                self._sync_invoice_to_db(invoice)
                print(f"Facture {invoice['invoice_number']} synchronisée")
            
            return len(invoices['data'])
        except requests.exceptions.RequestException as e:
            print(f"Erreur de synchronisation: {e}")
            raise

# Utilisation
client = ComptaFlowClient(os.getenv('COMPTAFLOW_API_KEY'))
synced_count = client.sync_invoices()
print(f"{synced_count} factures synchronisées")`,
      javascript: `// Configuration
const COMPTAFLOW_API_KEY = process.env.COMPTAFLOW_API_KEY;
const BASE_URL = 'https://api.comptaflow.com/api/v2';

class ComptaFlowClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = BASE_URL;
  }

  async getInvoices(status = null, page = 1) {
    const params = new URLSearchParams({
      page,
      limit: 50,
      ...(status && { status })
    });

    const response = await fetch(\`\${this.baseUrl}/invoices?\${params}\`, {
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(\`Erreur API: \${response.status}\`);
    }

    return response.json();
  }

  async syncInvoices(status = 'sent') {
    try {
      const { data: invoices } = await this.getInvoices(status);

      for (const invoice of invoices) {
        // Synchroniser avec votre base de données
        await this.syncInvoiceToDatabase(invoice);
        console.log(\`Facture \${invoice.invoice_number} synchronisée\`);
      }

      return invoices.length;
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      throw error;
    }
  }
}

// Utilisation
const client = new ComptaFlowClient(COMPTAFLOW_API_KEY);
const syncedCount = await client.syncInvoices();
console.log(\`\${syncedCount} factures synchronisées\`);`
    },
    paymentProcessing: {
      title: 'Traitement de Paiements',
      description: 'Enregistrer un paiement et mettre à jour le statut de la facture',
      php: `<?php
function processPayment($invoiceId, $amount, $paymentMethod = 'transfer') {
    global $apiKey, $baseUrl;
    
    $paymentData = [
        'invoice_id' => $invoiceId,
        'amount' => $amount,
        'payment_date' => date('Y-m-d'),
        'payment_method' => $paymentMethod,
        'reference' => 'PAY-' . uniqid(),
        'status' => 'completed'
    ];
    
    $ch = curl_init("$baseUrl/payments");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $apiKey",
        "Content-Type: application/json"
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 201) {
        throw new Exception("Erreur création paiement: $httpCode");
    }
    
    $payment = json_decode($response, true);
    
    // Notifier le client par email
    sendPaymentConfirmationEmail($invoiceId, $payment);
    
    return $payment;
}

// Utilisation avec gestion d'erreurs
try {
    $payment = processPayment(
        '550e8400-e29b-41d4-a716-446655440000',1800.00,'transfer'
    );
    echo "Paiement enregistré: {$payment['id']}\\n";
} catch (Exception $e) {
    error_log("Erreur traitement paiement: " . $e->getMessage());
    // Implémenter une logique de retry ou rollback
}
?>`,
      python: `def process_payment(client: ComptaFlowClient, invoice_id: str, 
                      amount: float, payment_method: str = 'transfer') -> Dict:
    """Traite un paiement et met à jour la facture"""
    from datetime import date
    import uuid
    
    payment_data = {
        'invoice_id': invoice_id,'amount': amount,'payment_date': date.today().isoformat(),
        'payment_method': payment_method,'reference': f'PAY-{uuid.uuid4().hex[:8]}','status': 'completed'
    }
    
    try:
        response = requests.post(
            f'{client.base_url}/payments',
            headers=client.headers,
            json=payment_data
        )
        response.raise_for_status()
        
        payment = response.json()
        
        # Notifier le client par email
        send_payment_confirmation_email(invoice_id, payment)
        
        return payment
        
    except requests.exceptions.RequestException as e:
        print(f"Erreur traitement paiement: {e}")
        # Implémenter une logique de retry ou rollback
        raise

# Utilisation
payment = process_payment(
    client,
    invoice_id='550e8400-e29b-41d4-a716-446655440000',
    amount=1800.00,
    payment_method='transfer'
)
print(f"Paiement enregistré: {payment['id']}")`,
      javascript: `async function processPayment(client, invoiceId, amount, paymentMethod = 'transfer') {
  const paymentData = {
    invoice_id: invoiceId,
    amount: amount,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: paymentMethod,
    reference: \`PAY-\${Date.now()}\`,
    status: 'completed'
  };

  try {
    const response = await fetch(\`\${client.baseUrl}/payments\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${client.apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error(\`Erreur création paiement: \${response.status}\`);
    }

    const payment = await response.json();

    // Notifier le client par email
    await sendPaymentConfirmationEmail(invoiceId, payment);

    return payment;

  } catch (error) {
    console.error('Erreur traitement paiement:', error);
    // Implémenter une logique de retry ou rollback
    throw error;
  }
}

// Utilisation
const payment = await processPayment(
  client,
  '550e8400-e29b-41d4-a716-446655440000',
  1800.00,
  'transfer'
);
console.log(\`Paiement enregistré: \${payment.id}\`);`
    },
    reportGeneration: {
      title: 'Génération de Rapports Automatisée',
      description: 'Générer et exporter des rapports financiers mensuels',
      php: `<?php
function generateMonthlyReport($year, $month) {
    global $apiKey, $baseUrl;
    
    $dateFrom = sprintf('%d-%02d-01', $year, $month);
    $dateTo = date('Y-m-t', strtotime($dateFrom));
    
    // Récupérer le compte de résultat
    $params = http_build_query([
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
        'format' => 'json'
    ]);
    
    $ch = curl_init("$baseUrl/reports/profit-loss?$params");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $apiKey",
        "Content-Type: application/json"
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $report = json_decode($response, true);
    
    // Générer le PDF
    $pdfContent = generatePdfFromReport($report);
    
    // Envoyer par email
    sendReportByEmail($pdfContent, "Rapport $month/$year");
    
    // Sauvegarder localement
    $filename = "report_{$year}_{$month}.pdf";
    file_put_contents("/reports/$filename", $pdfContent);
    
    return [
        'report' => $report,
        'filename' => $filename
    ];
}

// Automatisation mensuelle (cron job)
$result = generateMonthlyReport(date('Y'), date('m'));
echo "Rapport généré: {$result['filename']}\\n";
?>`,
      python: `from datetime import date, timedelta
import calendar

def generate_monthly_report(client: ComptaFlowClient, year: int, month: int) -> Dict:
    """Génère un rapport financier mensuel automatisé"""
    
    # Calculer les dates
    date_from = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    date_to = date(year, month, last_day)
    
    # Récupérer le compte de résultat
    params = {
        'date_from': date_from.isoformat(),
        'date_to': date_to.isoformat(),
        'format': 'json'
    }
    
    response = requests.get(
        f'{client.base_url}/reports/profit-loss',
        headers=client.headers,
        params=params
    )
    response.raise_for_status()
    
    report = response.json()
    
    # Générer le PDF
    pdf_content = generate_pdf_from_report(report)
    
    # Envoyer par email
    send_report_by_email(pdf_content, f"Rapport {month}/{year}")
    
    # Sauvegarder localement
    filename = f"report_{year}_{month:02d}.pdf"
    with open(f"/reports/{filename}", "wb") as f:
        f.write(pdf_content)
    
    return {
        'report': report,
        'filename': filename
    }

# Automatisation mensuelle (scheduler)
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

@scheduler.scheduled_job('cron', day=1, hour=9)  # 1er jour du mois à 9h
def monthly_report_job():
    today = date.today()
    result = generate_monthly_report(client, today.year, today.month)
    print(f"Rapport généré: {result['filename']}")

scheduler.start()`,
      javascript: `async function generateMonthlyReport(client, year, month) {
  // Calculer les dates
  const dateFrom = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const dateTo = new Date(year, month, 0).toISOString().split('T')[0];

  // Récupérer le compte de résultat
  const params = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
    format: 'json'
  });

  const response = await fetch(
    \`\${client.baseUrl}/reports/profit-loss?\${params}\`,
    {
      headers: {
        'Authorization': \`Bearer \${client.apiKey}\`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(\`Erreur génération rapport: \${response.status}\`);
  }

  const report = await response.json();

  // Générer le PDF
  const pdfContent = await generatePdfFromReport(report);

  // Envoyer par email
  await sendReportByEmail(pdfContent, \`Rapport \${month}/\${year}\`);

  // Sauvegarder localement
  const filename = \`report_\${year}_\${month.toString().padStart(2, '0')}.pdf\`;
  await fs.promises.writeFile(\`/reports/\${filename}\`, pdfContent);

  return {
    report,
    filename
  };
}

// Automatisation mensuelle (node-cron)
const cron = require('node-cron');

cron.schedule('0 9 1 * *', async () => {  // 1er jour du mois à 9h
  const now = new Date();
  const result = await generateMonthlyReport(client, now.getFullYear(), now.getMonth() + 1);
  console.log(\`Rapport généré: \${result.filename}\`);
});`
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-yellow-600" />
          Exemples d'Intégration
        </h2>
        <p className="text-gray-700 mb-6">
          Cas d'usage concrets avec code complet pour PHP, Python, et JavaScript.
        </p>

        {/* Language Selector */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          {['php', 'python', 'javascript']?.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors capitalize ${
                activeLanguage === lang
                  ? 'border-blue-600 text-blue-600' :'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'javascript' ? 'JavaScript' : lang?.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Examples */}
        <div className="space-y-8">
          {Object.entries(examples)?.map(([key, example]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Code className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{example?.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{example?.description}</p>
                </div>
              </div>

              <CodeBlock 
                code={example?.[activeLanguage]} 
                language={activeLanguage}
              />
            </div>
          ))}
        </div>

        {/* Error Handling Best Practices */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Bonnes Pratiques de Gestion d'Erreurs</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Toujours valider les entrées</strong> avant d'envoyer à l'API</li>
            <li>• <strong>Implémenter des retry avec backoff exponentiel</strong> pour les erreurs temporaires</li>
            <li>• <strong>Logger toutes les erreurs</strong> avec contexte complet pour le debugging</li>
            <li>• <strong>Utiliser des transactions</strong> quand plusieurs appels API sont liés</li>
            <li>• <strong>Gérer les timeouts</strong> - définir des limites raisonnables (30s recommandé)</li>
            <li>• <strong>Monitorer les taux d'erreur</strong> - alerter si &gt;1% sur 1 heure</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntegrationExamples;
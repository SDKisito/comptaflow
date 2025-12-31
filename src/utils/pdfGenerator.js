import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a professional French invoice PDF with compliance details
 * @param {Object} invoice - Invoice data object
 * @param {Object} companyInfo - Company information for invoice header
 * @returns {jsPDF} - Generated PDF document
 */
export const generateInvoicePDF = (invoice, companyInfo = {}) => {
  // Initialize PDF document with A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Default company information
  const defaultCompanyInfo = {
    name: 'ComptaFlow SARL',
    address: '123 Avenue de la Comptabilité',
    postalCode: '75001',
    city: 'Paris',
    country: 'France',
    phone: '+33 1 23 45 67 89',
    email: 'contact@comptaflow.fr',
    siret: '123 456 789 00012',
    tvaNumber: 'FR12345678901',
    ...companyInfo
  };

  // Calculate totals with proper French formatting
  const calculateTotals = (invoice) => {
    const totalHT = invoice?.items?.reduce((sum, item) => sum + (item?.total || 0), 0) || invoice?.amount || 0;
    const tvaRate = invoice?.tvaRate || 20;
    const tvaAmount = totalHT * (tvaRate / 100);
    const totalTTC = totalHT + tvaAmount;

    return {
      totalHT: totalHT?.toFixed(2),
      tvaRate,
      tvaAmount: tvaAmount?.toFixed(2),
      totalTTC: totalTTC?.toFixed(2)
    };
  };

  const totals = calculateTotals(invoice);

  // French number formatting helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  // French date formatting helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })?.format(date);
  };

  // Set document properties
  doc?.setProperties({
    title: `Facture ${invoice?.invoiceNumber}`,
    subject: `Facture pour ${invoice?.clientName}`,
    author: defaultCompanyInfo?.name,
    keywords: 'facture, invoice, comptabilité',
    creator: 'ComptaFlow'
  });

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const darkGray = [52, 73, 94];
  const lightGray = [236, 240, 241];

  // Header - Company Information
  doc?.setFillColor(...primaryColor);
  doc?.rect(0, 0, 210, 40, 'F');

  doc?.setTextColor(255, 255, 255);
  doc?.setFontSize(24);
  doc?.setFont('helvetica', 'bold');
  doc?.text(defaultCompanyInfo?.name, 15, 20);

  doc?.setFontSize(10);
  doc?.setFont('helvetica', 'normal');
  doc?.text(defaultCompanyInfo?.address, 15, 27);
  doc?.text(`${defaultCompanyInfo?.postalCode} ${defaultCompanyInfo?.city}, ${defaultCompanyInfo?.country}`, 15, 32);
  doc?.text(`Tél: ${defaultCompanyInfo?.phone} | Email: ${defaultCompanyInfo?.email}`, 15, 37);

  // Invoice Title
  doc?.setTextColor(...darkGray);
  doc?.setFontSize(28);
  doc?.setFont('helvetica', 'bold');
  doc?.text('FACTURE', 140, 20);

  // Invoice Number and Date
  doc?.setFontSize(11);
  doc?.setFont('helvetica', 'normal');
  doc?.text(`N° ${invoice?.invoiceNumber}`, 140, 28);
  doc?.text(`Date: ${formatDate(invoice?.issueDate)}`, 140, 34);
  doc?.text(`Échéance: ${formatDate(invoice?.dueDate)}`, 140, 40);

  // Client Information
  doc?.setFillColor(...lightGray);
  doc?.rect(15, 50, 90, 35, 'F');

  doc?.setTextColor(...darkGray);
  doc?.setFontSize(12);
  doc?.setFont('helvetica', 'bold');
  doc?.text('CLIENT', 20, 58);

  doc?.setFontSize(10);
  doc?.setFont('helvetica', 'normal');
  doc?.text(invoice?.clientName || '', 20, 65);
  doc?.text(invoice?.clientAddress || '', 20, 70, { maxWidth: 80 });
  doc?.text(invoice?.clientEmail || '', 20, 78);

  // Company Legal Information
  doc?.setFillColor(...lightGray);
  doc?.rect(110, 50, 85, 35, 'F');

  doc?.setFontSize(12);
  doc?.setFont('helvetica', 'bold');
  doc?.text('INFORMATIONS LÉGALES', 115, 58);

  doc?.setFontSize(9);
  doc?.setFont('helvetica', 'normal');
  doc?.text(`SIRET: ${defaultCompanyInfo?.siret}`, 115, 65);
  doc?.text(`N° TVA: ${defaultCompanyInfo?.tvaNumber}`, 115, 70);
  doc?.text('Capital social: 10 000 €', 115, 75);
  doc?.text('RCS Paris B 123 456 789', 115, 80);

  // Items Table
  const tableStartY = 95;

  const tableHeaders = [['Description', 'Qté', 'Prix unit. HT', 'Total HT']];
  const tableData = invoice?.items?.map(item => [
    item?.description || '',
    item?.quantity?.toString() || '1',
    formatCurrency(item?.unitPrice || 0),
    formatCurrency(item?.total || 0)
  ]) || [];

  doc?.autoTable({
    head: tableHeaders,
    body: tableData,
    startY: tableStartY,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 11,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 10,
      textColor: darkGray
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 15, right: 15 },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    }
  });

  // Totals Summary
  const finalY = doc?.lastAutoTable?.finalY + 10;

  // Totals box
  doc?.setFillColor(...lightGray);
  doc?.rect(120, finalY, 75, 35, 'F');

  doc?.setTextColor(...darkGray);
  doc?.setFontSize(11);
  doc?.setFont('helvetica', 'normal');

  doc?.text('Total HT:', 125, finalY + 8);
  doc?.text(formatCurrency(totals?.totalHT), 185, finalY + 8, { align: 'right' });

  doc?.text(`TVA (${totals?.tvaRate}%):`, 125, finalY + 15);
  doc?.text(formatCurrency(totals?.tvaAmount), 185, finalY + 15, { align: 'right' });

  doc?.setFontSize(13);
  doc?.setFont('helvetica', 'bold');
  doc?.text('Total TTC:', 125, finalY + 25);
  doc?.text(formatCurrency(totals?.totalTTC), 185, finalY + 25, { align: 'right' });

  // Payment Information
  const paymentY = finalY + 45;

  doc?.setFontSize(11);
  doc?.setFont('helvetica', 'bold');
  doc?.text('MODALITÉS DE PAIEMENT', 15, paymentY);

  doc?.setFontSize(9);
  doc?.setFont('helvetica', 'normal');
  doc?.text('Paiement à réception de facture', 15, paymentY + 6);
  doc?.text('Virement bancaire: FR76 1234 5678 9012 3456 7890 123', 15, paymentY + 11);
  doc?.text('En cas de retard de paiement, des pénalités de 3 fois le taux d\'intérêt légal', 15, paymentY + 16);
  doc?.text('seront appliquées, ainsi qu\'une indemnité forfaitaire de 40€.', 15, paymentY + 21);

  // Additional Notes
  if (invoice?.notes) {
    const notesY = paymentY + 30;
    doc?.setFontSize(11);
    doc?.setFont('helvetica', 'bold');
    doc?.text('NOTES', 15, notesY);

    doc?.setFontSize(9);
    doc?.setFont('helvetica', 'normal');
    const splitNotes = doc?.splitTextToSize(invoice?.notes, 180);
    doc?.text(splitNotes, 15, notesY + 6);
  }

  // Footer - Legal Compliance
  const footerY = 280;
  doc?.setDrawColor(...lightGray);
  doc?.line(15, footerY, 195, footerY);

  doc?.setFontSize(8);
  doc?.setTextColor(128, 128, 128);
  doc?.setFont('helvetica', 'italic');
  const footerText = `${defaultCompanyInfo?.name} - SIRET: ${defaultCompanyInfo?.siret} - N° TVA: ${defaultCompanyInfo?.tvaNumber}`;
  doc?.text(footerText, 105, footerY + 5, { align: 'center' });

  doc?.setFont('helvetica', 'normal');
  doc?.text('Facture conforme aux obligations légales françaises - TVA sur les débits', 105, footerY + 9, { align: 'center' });

  return doc;
};

/**
 * Download invoice as PDF file
 * @param {Object} invoice - Invoice data
 * @param {Object} companyInfo - Company information
 */
export const downloadInvoicePDF = (invoice, companyInfo) => {
  const doc = generateInvoicePDF(invoice, companyInfo);
  const filename = `Facture_${invoice?.invoiceNumber || 'Sans_Numero'}.pdf`;
  doc?.save(filename);
};

/**
 * Generate PDF blob for email attachment or preview
 * @param {Object} invoice - Invoice data
 * @param {Object} companyInfo - Company information
 * @returns {Blob} - PDF blob
 */
export const generateInvoicePDFBlob = (invoice, companyInfo) => {
  const doc = generateInvoicePDF(invoice, companyInfo);
  return doc?.output('blob');
};

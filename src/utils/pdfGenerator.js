// pdfGenerator.js

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  name: companyInfo?.name || '',
  address: companyInfo?.address || '',
  postalCode: companyInfo?.postalCode || '',
  city: companyInfo?.city || '',
  country: companyInfo?.country || '',
  phone: companyInfo?.phone || '',
  email: companyInfo?.email || '',
  siret: companyInfo?.siret || '',
  tvaNumber: companyInfo?.tvaNumber || ''
};

  // Calculate totals
  const calculateTotals = () => {
    const totalHT =
      invoice?.items?.reduce((sum, item) => sum + (item?.total || 0), 0) ??
      invoice?.amount ??
      0;

    const tvaRate = invoice?.tvaRate ?? 20;
    const tvaAmount = totalHT * (tvaRate / 100);
    const totalTTC = totalHT + tvaAmount;

    return {
      totalHT,
      tvaRate,
      tvaAmount,
      totalTTC
    };
  };

  const totals = calculateTotals();

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('fr-FR');

  // Document metadata
  doc.setProperties({
    title: `Facture ${invoice?.invoiceNumber}`,
    subject: `Facture pour ${invoice?.clientName}`,
    author: defaultCompanyInfo.name,
    creator: 'ComptaFlow'
  });

  // Colors
  const primaryColor = [41, 128, 185];
  const darkGray = [52, 73, 94];
  const lightGray = [236, 240, 241];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(defaultCompanyInfo.name, 15, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(defaultCompanyInfo.address, 15, 27);
  doc.text(
    `${defaultCompanyInfo.postalCode} ${defaultCompanyInfo.city}`,
    15,
    32
  );
 let contactLine = '';

 if (defaultCompanyInfo.phone && defaultCompanyInfo.email) {
  contactLine = `Tél: ${defaultCompanyInfo.phone} | Email: ${defaultCompanyInfo.email}`;
} else if (defaultCompanyInfo.phone) {
  contactLine = `Tél: ${defaultCompanyInfo.phone}`;
} else if (defaultCompanyInfo.email) {
  contactLine = `Email: ${defaultCompanyInfo.email}`;
}

if (contactLine) {
  doc.text(contactLine, 15, 37);
}

  // Invoice title
  doc.setTextColor(...darkGray);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 140, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice?.invoiceNumber}`, 140, 28);
  doc.text(`Date : ${formatDate(invoice?.issueDate)}`, 140, 34);
  doc.text(`Échéance : ${formatDate(invoice?.dueDate)}`, 140, 40);

  // Client box
  doc.setFillColor(...lightGray);
  doc.rect(15, 50, 90, 35, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 20, 58);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice?.clientName || '', 20, 65);
  doc.text(invoice?.clientAddress || '', 20, 70, { maxWidth: 80 });
  doc.text(invoice?.clientEmail || '', 20, 78);

  // Legal box
  doc.setFillColor(...lightGray);
  doc.rect(110, 50, 85, 35, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS LÉGALES', 115, 58);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`SIRET : ${defaultCompanyInfo.siret}`, 115, 65);
  doc.text(`TVA : ${defaultCompanyInfo.tvaNumber}`, 115, 70);

  // Items table
  const tableHeaders = [['Description', 'Qté', 'Prix unit. HT', 'Total HT']];
  const tableData =
    invoice?.items?.map((item) => [
      item?.description ?? '',
      item?.quantity?.toString() ?? '1',
      formatCurrency(item?.unitPrice ?? 0),
      formatCurrency(item?.total ?? 0)
    ]) ?? [];

  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: 95,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
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
    margin: { left: 15, right: 15 }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Totals
  doc.setFillColor(...lightGray);
  doc.rect(120, finalY, 75, 35, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Total HT :', 125, finalY + 8);
  doc.text(formatCurrency(totals.totalHT), 185, finalY + 8, { align: 'right' });

  doc.text(`TVA (${totals.tvaRate}%) :`, 125, finalY + 15);
  doc.text(formatCurrency(totals.tvaAmount), 185, finalY + 15, {
    align: 'right'
  });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC :', 125, finalY + 25);
  doc.text(formatCurrency(totals.totalTTC), 185, finalY + 25, {
    align: 'right'
  });

  return doc;
};

/**
 * Download invoice as PDF file
 */
export const downloadInvoicePDF = (invoice, companyInfo) => {
  const doc = generateInvoicePDF(invoice, companyInfo);
  doc.save(`Facture_${invoice?.invoiceNumber || 'Sans_Numero'}.pdf`);
};

/**
 * Generate PDF blob
 */
export const generateInvoicePDFBlob = (invoice, companyInfo) => {
  const doc = generateInvoicePDF(invoice, companyInfo);
  return doc.output('blob');
};

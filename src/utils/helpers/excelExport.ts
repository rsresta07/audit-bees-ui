import * as XLSX from "xlsx";

interface ExportExcelParams {
  transactions: any[];
  clientData?: {
    name: string;
    pan: string;
    vatPeriod?: string;
  };
  filename?: string;
}

export const exportTransactionsToExcel = ({ transactions, clientData, filename }: ExportExcelParams) => {
  const wb = XLSX.utils.book_new();

  const salesTransactions = transactions.filter(t => t.type.includes("Sales"));
  const purchaseTransactions = transactions.filter(t => t.type.includes("Purchase"));

  // Create Sales Sheet
  const salesData: any[][] = [];
  salesData.push(["बिक्री खाता"]);
  salesData.push(["(नियम २३ को उपनियम (१) को खण्ड  (ज) संग सम्बन्धित ) "]);
  salesData.push([]);
  
  const clientName = clientData?.name || ".......................";
  const clientPan = clientData?.pan || "..................";
  const vatPeriod = clientData?.vatPeriod || "................";
  
  salesData.push([`करदाता दर्ता नं (PAN) : ${clientPan}        करदाताको नाम: ${clientName}         साल    .................      कर अवधि: ${vatPeriod}`]);
  salesData.push([
    "बीजक", "", "", "", "जम्मा बिक्री / निकासी (रु)", "स्थानीय कर छुटको बिक्री  मूल्य (रु)", "करयोग्य बिक्री", "", "निकासी"
  ]);
  salesData.push([
    "मिति", "बीजक नम्बर", "खरिदकर्ताको नाम", "खरिदकर्ताको स्थायी लेखा नम्बर", "", "", "मूल्य (रु)", "कर (रु)", "निकासी गरेको वस्तु वा सेवाको मूल्य (रु)", "निकासी गरेको देश", "निकासी प्रज्ञापनपत्र नम्बर", "निकासी प्रज्ञापनपत्र मिति"
  ]);

  salesTransactions.forEach(tx => {
    const amount = tx.amount || 0;
    const tax = tx.tax || 0;
    // Total should be the sum or based on how it's defined, assuming amount + tax
    const total = amount + tax;

    const buyerName = tx.client || tx.particulars || tx.particular || "N/A";
    const buyerPan = tx.pan || "";
    
    // In transactions array, some items might have .items
    if (tx.items && tx.items.length > 0) {
      tx.items.forEach((item: any) => {
        const itemAmount = item.amount || 0;
        const itemTax = item.tax || 0;
        const itemTotal = item.grandTotal || (itemAmount + itemTax);
        
        let finalInvoice = item.invoice || tx.invoice || "-";
        if (tx.type.includes("Return")) {
          finalInvoice = [item.debitInvoice ? `Dr: ${item.debitInvoice}` : "", item.creditInvoice ? `Cr: ${item.creditInvoice}` : ""].filter(Boolean).join(" | ") || "-";
        }
        
        salesData.push([
          tx.date,
          finalInvoice,
          item.particulars || buyerName,
          item.pan || buyerPan,
          itemTotal,
          0,
          itemAmount,
          itemTax,
          0,
          "",
          "",
          ""
        ]);
      });
    } else {
      let finalInvoice = tx.invoice || "-";
      if (tx.type.includes("Return")) {
        finalInvoice = [tx.debitInvoice ? `Dr: ${tx.debitInvoice}` : "", tx.creditInvoice ? `Cr: ${tx.creditInvoice}` : ""].filter(Boolean).join(" | ") || "-";
      }

      salesData.push([
        tx.date,
        finalInvoice,
        buyerName,
        buyerPan,
        total,
        0, 
        amount,
        tax,
        0, 
        "",
        "",
        ""
      ]);
    }
  });

  const wsSales = XLSX.utils.aoa_to_sheet(salesData);
  wsSales['!merges'] = [
    { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },
    { s: { r: 4, c: 6 }, e: { r: 4, c: 7 } },
    { s: { r: 4, c: 8 }, e: { r: 4, c: 11 } },
  ];
  XLSX.utils.book_append_sheet(wb, wsSales, "Sales");

  // Create Purchase Sheet
  const purchaseData: any[][] = [];
  purchaseData.push(["खरिद खाता"]);
  purchaseData.push(["(नियम २३ को उपनियम (१) को खण्ड  (छ) संग सम्बन्धित ) "]);
  purchaseData.push([]);
  purchaseData.push([`करदाता दर्ता नं (PAN) : ${clientPan}        करदाताको नाम: ${clientName}         साल    .................      कर अवधि: ${vatPeriod}`]);
  purchaseData.push([
    "बीजक / प्रज्ञापनपत्र नम्बर", "", "", "", "", "जम्मा खरिद मूल्य (रु)", "कर छुट हुने वस्तु वा सेवाको खरिद / पैठारी मूल्य (रु)", "करयोग्य खरिद (पूंजीगत बाहेक)", "", "करयोग्य पैठारी (पूंजीगत बाहेक)", "", "पूंजीगत करयोग्य खरिद / पैठारी "
  ]);
  purchaseData.push([
    "मिति", "बीजक नं.", "प्रज्ञापनपत्र नं.", "आपूर्तिकर्ताको नाम", "आपूर्तिकर्ताको स्थायी लेखा नम्बर", "", "", "मूल्य (रु)", "कर (रु)", "मूल्य (रु)", "कर (रु)", " मूल्य (रु)", "कर (रु)"
  ]);

  purchaseTransactions.forEach(tx => {
    const amount = tx.amount || 0;
    const tax = tx.tax || 0;
    const total = amount + tax;
    
    const supplierName = tx.client || tx.particulars || tx.particular || "N/A";
    const supplierPan = tx.pan || "";

    if (tx.items && tx.items.length > 0) {
      tx.items.forEach((item: any) => {
        const itemAmount = item.amount || 0;
        const itemTax = item.tax || 0;
        const itemTotal = item.grandTotal || (itemAmount + itemTax);
        
        let finalInvoice = item.invoice || tx.invoice || "-";
        if (tx.type.includes("Return")) {
          finalInvoice = [item.debitInvoice ? `Dr: ${item.debitInvoice}` : "", item.creditInvoice ? `Cr: ${item.creditInvoice}` : ""].filter(Boolean).join(" | ") || "-";
        }

        purchaseData.push([
          tx.date,
          finalInvoice,
          "",
          item.particulars || supplierName,
          item.pan || supplierPan,
          itemTotal,
          0,
          (item.isCapitalPurchase || tx.isCapitalPurchase) ? 0 : itemAmount,
          (item.isCapitalPurchase || tx.isCapitalPurchase) ? 0 : itemTax,
          0,
          0,
          (item.isCapitalPurchase || tx.isCapitalPurchase) ? itemAmount : 0,
          (item.isCapitalPurchase || tx.isCapitalPurchase) ? itemTax : 0
        ]);
      });
    } else {
      let finalInvoice = tx.invoice || "-";
      if (tx.type.includes("Return")) {
        finalInvoice = [tx.debitInvoice ? `Dr: ${tx.debitInvoice}` : "", tx.creditInvoice ? `Cr: ${tx.creditInvoice}` : ""].filter(Boolean).join(" | ") || "-";
      }

      purchaseData.push([
        tx.date,
        finalInvoice,
        "",
        supplierName,
        supplierPan,
        total,
        0,
        tx.isCapitalPurchase ? 0 : amount,
        tx.isCapitalPurchase ? 0 : tax,
        0,
        0,
        tx.isCapitalPurchase ? amount : 0,
        tx.isCapitalPurchase ? tax : 0
      ]);
    }
  });

  const wsPurchase = XLSX.utils.aoa_to_sheet(purchaseData);
  wsPurchase['!merges'] = [
    { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } },
    { s: { r: 4, c: 7 }, e: { r: 4, c: 8 } },
    { s: { r: 4, c: 9 }, e: { r: 4, c: 10 } },
    { s: { r: 4, c: 11 }, e: { r: 4, c: 12 } },
  ];
  XLSX.utils.book_append_sheet(wb, wsPurchase, "Purchase");

  XLSX.writeFile(wb, filename || `Export_${new Date().toISOString().split("T")[0]}.xlsx`);
};

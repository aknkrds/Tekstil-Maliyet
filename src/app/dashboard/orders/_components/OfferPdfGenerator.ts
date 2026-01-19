import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define the type for jsPDF instance with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

export type OfferType = 'OPEN_COST' | 'CLOSED_COST' | 'OFFER';

export interface OfferPdfOptions {
  order: any;
  product: any;
  type: OfferType;
  vatRate: number;
}

const loadFonts = async (doc: jsPDF) => {
  try {
    // Roboto Regular supports Turkish characters
    const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
    if (!response.ok) throw new Error('Font fetch failed');
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise<void>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove the data URL prefix if present (e.g. "data:font/ttf;base64,")
        const base64Content = base64data.split(',')[1];
        
        doc.addFileToVFS('Roboto-Regular.ttf', base64Content);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');
        resolve();
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Font loading failed, falling back to standard font', error);
    // Fallback to helvetica (Turkish chars might be broken)
    doc.setFont('helvetica');
  }
};

export const generateOfferPdf = async ({ order, product, type, vatRate }: OfferPdfOptions) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Load custom font for Turkish support
  await loadFonts(doc);

  const pageWidth = doc.internal.pageSize.width;

  // Calculate costs and multiplier from ORDER fields
  // The Order model has specific fields for each cost item (snapshot).
  // We prefer these over product.* fields to ensure we show exactly what's in the order.
  
  const q = Number(order.quantity || 1);
  const profitMargin = Number(order.marginValue || 0);
  const isPercent = order.marginType === 'PERCENT';
  
  // Base Costs (Unit Costs)
  const fabricPrice = Number(order.fabricPrice || 0);
  const acc1Price = Number(order.accessory1Price || 0);
  const acc2Price = Number(order.accessory2Price || 0);
  const acc3Price = Number(order.accessory3Price || 0);
  const cuttingPrice = Number(order.cuttingPrice || 0);
  const sewingPrice = Number(order.sewingPrice || 0);
  const ironingPrice = Number(order.ironingPrice || 0);
  const shippingPrice = Number(order.shippingPrice || 0);

  const totalBaseCost = fabricPrice + acc1Price + acc2Price + acc3Price + cuttingPrice + sewingPrice + ironingPrice + shippingPrice;

  // Calculate Profit Multiplier
  let multiplier = 1;
  if (totalBaseCost > 0) {
    if (isPercent) {
      multiplier = 1 + (profitMargin / 100);
    } else {
      multiplier = (totalBaseCost + profitMargin) / totalBaseCost;
    }
  }
  
  // Header
  doc.setFontSize(18);
  doc.text('TEKLİF FORMU', pageWidth / 2, 20, { align: 'center' });

  // Customer & Order Info
  doc.setFontSize(10);
  doc.text(`Sayın: ${order.customer?.name || '-'}`, 14, 40);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth - 50, 40);
  doc.text(`Sipariş Adedi: ${q}`, 14, 46);
  doc.text(`Teklif No: ${order.orderNumber || '-'}`, pageWidth - 50, 46);

  let startY = 60;

  // Data Preparation
  const rows: any[] = [];
  let totalAmount = 0;

  const fmt = (num: number) => `$${num.toFixed(2)}`;

  // Helper to create a row
  const createRow = (name: string, consumption: number | string, unit: string, waste: number | string, unitCost: number) => {
    if (!name && unitCost === 0) return null;
    
    const consVal = typeof consumption === 'number' ? consumption : parseFloat(String(consumption)) || 0;
    const unitPriceWithProfit = unitCost * multiplier;
    const totalLinePrice = unitPriceWithProfit * consVal * q;
    
    // Format waste
    const wasteStr = waste ? `%${waste}` : '-';
    
    return [
      name,
      `${consumption} ${unit}`,
      wasteStr,
      fmt(unitPriceWithProfit),
      fmt(totalLinePrice)
    ];
  };

  const createRowClosed = (name: string, consumption: number | string, unit: string, waste: number | string) => {
    if (!name) return null;
    const wasteStr = waste ? `%${waste}` : '-';
    return [
      name,
      `${consumption} ${unit}`,
      wasteStr
    ];
  };

  // Prepare data from Product (Recipe) + Order (for specific overrides if any)
  // We prioritize Product Materials because Order snapshots might be incomplete/aggregated.
  
  const fabrics: any[] = [];
  const accessories: any[] = [];
  
  // 1. Process Product Materials
  if (product && product.materials) {
    product.materials.forEach((pm: any) => {
      const isFabric = ['m', 'mt', 'metre', 'kg', 'gr', 'gram'].some(u => pm.material.unit?.toLowerCase().includes(u));
      const item = {
        name: pm.material.name,
        consumption: Number(pm.quantity),
        unit: pm.material.unit,
        waste: Number(pm.waste || 0),
        price: Number(pm.material.price)
      };
      
      if (isFabric) fabrics.push(item);
      else accessories.push(item);
    });
  }

  // 2. Process Manual Recipe
  if (product && product.manualRecipe && Array.isArray(product.manualRecipe)) {
    product.manualRecipe.forEach((item: any) => {
       // Assume manual items are accessories unless specified otherwise, or check unit
       const isFabric = ['m', 'mt', 'metre', 'kg', 'gr', 'gram'].some(u => item.unit?.toLowerCase().includes(u));
       const mItem = {
         name: item.name,
         consumption: Number(item.quantity || 0),
         unit: item.unit,
         waste: Number(item.waste || 0),
         price: Number(item.unitPrice || 0)
       };
       if (isFabric) fabrics.push(mItem);
       else accessories.push(mItem);
    });
  }

  // 3. Labor Costs
  // Product has single laborCost. Order has breakdown fields (often 0).
  // If Order has breakdown, use it. Else use Product total.
  // User specifically requested: Kesim, Dikim, Ütü Paket.
  
  const laborItems: any[] = [];
  // Check if we have specific labor prices in Order that are > 0
  const hasOrderLabor = cuttingPrice > 0 || sewingPrice > 0 || ironingPrice > 0;
  
  if (hasOrderLabor) {
    if (cuttingPrice > 0) laborItems.push({ name: 'Kesim', price: cuttingPrice });
    if (sewingPrice > 0) laborItems.push({ name: 'Dikim', price: sewingPrice });
    if (ironingPrice > 0) laborItems.push({ name: 'Ütü & Paket', price: ironingPrice });
  } else {
    // Fallback to Product Labor Cost
    const lCost = Number(product?.laborCost || 0);
    if (lCost > 0) {
      // If we can't break it down, we show it as a single line or split it equally?
      // Better to show single line to be accurate.
      // But user wants the names.
      // Let's list "İşçilik (Kesim, Dikim, Ütü Paket)"
      laborItems.push({ name: 'İşçilik (Kesim, Dikim, Ütü Paket)', price: lCost });
    }
  }

  // 4. Other Costs
  const otherItems: any[] = [];
  const oCost = Number(product?.overheadCost || 0);
  if (oCost > 0) {
    otherItems.push({ name: 'Diğer Giderler', price: oCost });
  }
  if (shippingPrice > 0) {
    otherItems.push({ name: 'Sevkiyat / Nakliye', price: shippingPrice });
  }

  if (type === 'OPEN_COST') {
    // 1. Fabrics
    fabrics.forEach(f => {
      const r = createRow(f.name, f.consumption, f.unit, f.waste, f.price);
      if (r) rows.push(r);
    });

    // 2. Accessories
    accessories.forEach(a => {
      const r = createRow(a.name, a.consumption, a.unit, a.waste, a.price);
      if (r) rows.push(r);
    });

    // 3. Labor
    laborItems.forEach(l => {
      // For labor, consumption is 1 per unit (usually)
      const r = createRow(l.name, 1, 'Adet', 0, l.price);
      if (r) rows.push(r);
    });

    // 4. Other
    otherItems.forEach(o => {
      const r = createRow(o.name, 1, 'Adet', 0, o.price);
      if (r) rows.push(r);
    });

    // Recalculate total
    totalAmount = rows.reduce((acc, row) => {
      const valStr = row[4].replace('$', '').replace(',', '');
      return acc + Number(valStr);
    }, 0);

    autoTable(doc, {
      startY,
      head: [['Kalem', 'Birim Sarfiyat', 'Fire', 'Birim Fiyat', 'Toplam (USD)']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] }, // Greenish
      styles: { font: 'Roboto' },
    });

  } else if (type === 'CLOSED_COST') {
    // 1. Fabrics
    fabrics.forEach(f => {
      const r = createRowClosed(f.name, f.consumption, f.unit, f.waste);
      if (r) rows.push(r);
    });

    // 2. Accessories
    accessories.forEach(a => {
      const r = createRowClosed(a.name, a.consumption, a.unit, a.waste);
      if (r) rows.push(r);
    });

    // 3. Labor
    laborItems.forEach(l => {
      rows.push([l.name, '1 Adet', '-']);
    });

    // 4. Other
    otherItems.forEach(o => {
      rows.push([o.name, '1 Adet', '-']);
    });

    // Total Amount
    let calcTotal = 0;
    const calculateItemTotal = (price: number, consumption: number | string) => {
        const c = typeof consumption === 'number' ? consumption : parseFloat(String(consumption)) || 0;
        return (price * multiplier * c) * q;
    };
    
    fabrics.forEach(f => calcTotal += calculateItemTotal(f.price, f.consumption));
    accessories.forEach(a => calcTotal += calculateItemTotal(a.price, a.consumption));
    laborItems.forEach(l => calcTotal += calculateItemTotal(l.price, 1));
    otherItems.forEach(o => calcTotal += calculateItemTotal(o.price, 1));
    
    totalAmount = calcTotal;

    autoTable(doc, {
      startY,
      head: [['Kalem (İçerik)', 'Miktar', 'Fire']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Blueish
      styles: { font: 'Roboto' },
    });

  } else if (type === 'OFFER') {

    // Offer: Single line summary
    const productName = product?.name || order.productType || 'Ürün';
    
    // Recalculate total
    let calcTotal = 0;
    const calculateItemTotal = (price: number, consumption: number | string) => {
        const c = typeof consumption === 'number' ? consumption : parseFloat(String(consumption)) || 0;
        return (price * multiplier * c) * q;
    };
    
    fabrics.forEach(f => calcTotal += calculateItemTotal(f.price, f.consumption));
    accessories.forEach(a => calcTotal += calculateItemTotal(a.price, a.consumption));
    laborItems.forEach(l => calcTotal += calculateItemTotal(l.price, 1));
    otherItems.forEach(o => calcTotal += calculateItemTotal(o.price, 1));
    
    totalAmount = calcTotal;
    
    rows.push([productName, fmt(totalAmount)]);

    autoTable(doc, {
      startY,
      head: [['Ürün / Hizmet', 'Tutar']],
      body: rows,
      theme: 'plain',
      headStyles: { fillColor: [75, 85, 99] }, // Gray
      styles: { font: 'Roboto' },
    });
  }

  // Footer / Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  const vatAmount = totalAmount * (vatRate / 100);
  const grandTotal = totalAmount + vatAmount;

  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  const rightMargin = pageWidth - 14;
  
  // Subtotal (Total excluding VAT)
  doc.text(`Toplam Tutar:`, rightMargin - 40, finalY, { align: 'right' });
  doc.text(`$${totalAmount.toFixed(2)}`, rightMargin, finalY, { align: 'right' });
  
  // VAT
  doc.text(`KDV (%${vatRate}):`, rightMargin - 40, finalY + 6, { align: 'right' });
  doc.text(`$${vatAmount.toFixed(2)}`, rightMargin, finalY + 6, { align: 'right' });
  
  // Grand Total
  doc.setFontSize(12);
  doc.setFont('Roboto', 'bold');
  
  doc.text(`Genel Toplam:`, rightMargin - 40, finalY + 14, { align: 'right' });
  doc.text(`$${grandTotal.toFixed(2)}`, rightMargin, finalY + 14, { align: 'right' });

  // Save
  doc.save(`Teklif_${order.orderNumber || 'Taslak'}.pdf`);
};

import { jsPDF } from 'jspdf';
import { EventItem, VendorBooking } from '../types';
import { calculateEventDashboardStats, formatDateRange } from './storage';

export interface LoadedImageInfo {
  dataUrl: string;
  width: number;
  height: number;
}

// Helper to convert image URL to base64 Data URL with natural dimensions for jsPDF embedding
export const loadImageDataUrl = (url: string): Promise<LoadedImageInfo> => {
  return new Promise((resolve, reject) => {
    if (!url) return reject('No URL provided');
    if (url.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl: url,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
        });
      };
      img.onerror = () => resolve({ dataUrl: url, width: 800, height: 600 });
      img.src = url;
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 600;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', 0.92),
            width,
            height,
          });
        } else {
          reject('Canvas context failed');
        }
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

// 1-Click Formatted Text Generator for WhatsApp / Messages with Exact Stall Numbers
export const formatStallAvailabilityText = (
  event: EventItem,
  bookings: VendorBooking[]
): string => {
  const stats = calculateEventDashboardStats(event, bookings);
  const eventBookings = bookings.filter((b) => b.eventId === event.id);

  // F-Series breakdown
  const fBookings = eventBookings.filter((b) => b.series === 'F');
  const fBookedMap = new Map<string, string>(); // stallNumber -> exhibitor/stall name
  fBookings.forEach((b) => {
    const key = b.stallNumber.trim().toUpperCase();
    fBookedMap.set(key, `${b.exhibitorName}${b.stallName ? ` - ${b.stallName}` : ''}`);
  });

  const fVacant: string[] = [];
  const fBooked: string[] = [];
  for (let i = 1; i <= event.fSeriesLimit; i++) {
    const numPadded = `F-${String(i).padStart(2, '0')}`;
    const numUnpadded = `F-${i}`;
    if (fBookedMap.has(numPadded)) {
      fBooked.push(`${numPadded} (${fBookedMap.get(numPadded)})`);
    } else if (fBookedMap.has(numUnpadded)) {
      fBooked.push(`${numUnpadded} (${fBookedMap.get(numUnpadded)})`);
    } else {
      fVacant.push(numPadded);
    }
  }

  // S-Series breakdown
  const sBookings = eventBookings.filter((b) => b.series === 'S');
  const sBookedMap = new Map<string, string>(); // stallNumber -> exhibitor/stall name
  sBookings.forEach((b) => {
    const key = b.stallNumber.trim().toUpperCase();
    sBookedMap.set(key, `${b.exhibitorName}${b.stallName ? ` - ${b.stallName}` : ''}`);
  });

  const sVacant: string[] = [];
  const sBooked: string[] = [];
  for (let i = 1; i <= event.sSeriesLimit; i++) {
    const numPadded = `S-${String(i).padStart(2, '0')}`;
    const numUnpadded = `S-${i}`;
    if (sBookedMap.has(numPadded)) {
      sBooked.push(`${numPadded} (${sBookedMap.get(numPadded)})`);
    } else if (sBookedMap.has(numUnpadded)) {
      sBooked.push(`${numUnpadded} (${sBookedMap.get(numUnpadded)})`);
    } else {
      sVacant.push(numPadded);
    }
  }

  const formatList = (stalls: string[]) => {
    if (stalls.length === 0) return 'None';
    return stalls.join(', ');
  };

  return `✨ THE VELVET TRUNK - EXHIBITION STALL AVAILABILITY UPDATE ✨

📌 Event: ${event.name}
📍 Location: ${event.location}
📅 Dates: ${formatDateRange(event.startDate, event.endDate)}${
    event.timing ? ` (${event.timing})` : ''
  }

📊 TOTAL OCCUPANCY SUMMARY:
• Total Exhibition Capacity: ${stats.totalStalls} Stalls
• Stalls Booked: ${stats.stallsBooked} Stalls
🟢 REMAINING AVAILABLE STALLS: ${stats.stallsAvailable} STALLS

----------------------------------------
🏷️ F-SERIES (FRONT PAVILION):
• Capacity: ${event.fSeriesLimit} Stalls (${fBooked.length} Booked | ${fVacant.length} Vacant)
🟢 VACANT STALLS AVAILABLE:
${formatList(fVacant)}
${fBooked.length > 0 ? `\n🔴 ALREADY BOOKED:\n${formatList(fBooked)}` : ''}

----------------------------------------
🏷️ S-SERIES (VIP SELECT):
• Capacity: ${event.sSeriesLimit} Stalls (${sBooked.length} Booked | ${sVacant.length} Vacant)
🟢 VACANT STALLS AVAILABLE:
${formatList(sVacant)}
${sBooked.length > 0 ? `\n🔴 ALREADY BOOKED:\n${formatList(sBooked)}` : ''}

----------------------------------------
🗺️ Match these stall numbers directly with the attached Layout Blueprint Floor Plan!
📞 For Stall Bookings & Reservations, contact Velvet Trunk Event Team!`;
};

// -----------------------------------------------------------------------------
// PDF EXPORT 1: VENDOR BLUEPRINT & AVAILABILITY PDF (FOR VENDORS - ZERO FINANCIAL DATA)
// -----------------------------------------------------------------------------
export const generateVendorBlueprintPDF = async (
  event: EventItem,
  bookings: VendorBooking[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const stats = calculateEventDashboardStats(event, bookings);
  const eventBookings = bookings.filter((b) => b.eventId === event.id);

  // Brand Colors
  const primaryColor = [73, 21, 70]; // #491546
  const secondaryColor = [144, 66, 119]; // #904277
  const darkTextColor = [30, 26, 29]; // #1e1a1d
  const lightBgColor = [250, 241, 245]; // #faf1f5

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(event.name.toUpperCase(), 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('THE VELVET TRUNK - EXHIBITION FLOOR PLAN & STALL AVAILABILITY (VENDOR REPORT)', 14, 22);
  doc.text(
    `Date: ${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`,
    145,
    22
  );

  let y = 38;

  // Event Meta Info Box
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.roundedRect(14, y, 182, 20, 2, 2, 'F');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Location:', 18, y + 6.5);
  doc.text('Exhibition Dates:', 18, y + 14);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(event.location, 48, y + 6.5);
  doc.text(
    `${formatDateRange(event.startDate, event.endDate)}${
      event.timing ? ` (${event.timing})` : ''
    }`,
    48,
    y + 14
  );

  y += 26;

  // Stall Occupancy Overview Cards (No monetary values)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('EXHIBITION STALL AVAILABILITY SUMMARY', 14, y);

  y += 4;

  const cardWidth = 58;
  const cardGap = 4;
  const cards = [
    { title: 'Total Capacity', val: `${stats.totalStalls} Stalls` },
    { title: 'Occupied / Booked', val: `${stats.stallsBooked} Stalls` },
    { title: 'VACANT AVAILABLE NOW', val: `${stats.stallsAvailable} STALLS` },
  ];

  cards.forEach((card, idx) => {
    const x = 14 + idx * (cardWidth + cardGap);
    doc.setFillColor(idx === 2 ? 232 : 245, idx === 2 ? 245 : 238, idx === 2 ? 238 : 242);
    doc.roundedRect(x, y, cardWidth, 16, 2, 2, 'F');

    doc.setFontSize(7);
    doc.setTextColor(idx === 2 ? 16 : 120, idx === 2 ? 122 : 100, idx === 2 ? 70 : 115);
    doc.setFont('helvetica', 'bold');
    doc.text(card.title.toUpperCase(), x + 4, y + 5);

    doc.setFontSize(9);
    doc.setTextColor(idx === 2 ? 16 : primaryColor[0], idx === 2 ? 122 : primaryColor[1], idx === 2 ? 70 : primaryColor[2]);
    doc.text(card.val, x + 4, y + 12);
  });

  y += 22;

  // Vendor Stall Allocations Table Header (Zero financial data)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`CURRENT STALL ALLOCATIONS (${eventBookings.length} BOOKED)`, 14, y);

  y += 4;

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(14, y, 182, 7.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  doc.text('Stall No', 18, y + 5);
  doc.text('Exhibitor / Stall Name', 45, y + 5);
  doc.text('Category', 125, y + 5);
  doc.text('Status', 170, y + 5);

  y += 7.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  if (eventBookings.length === 0) {
    doc.setTextColor(120, 120, 120);
    doc.text('All stalls are currently open and available for booking.', 18, y + 6);
    y += 10;
  } else {
    eventBookings.forEach((b, index) => {
      if (y > 270) {
        doc.addPage();
        y = 15;
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(14, y, 182, 7.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('Stall No', 18, y + 5);
        doc.text('Exhibitor / Stall Name', 45, y + 5);
        doc.text('Category', 125, y + 5);
        doc.text('Status', 170, y + 5);
        y += 7.5;
        doc.setFont('helvetica', 'normal');
      }

      if (index % 2 === 0) {
        doc.setFillColor(252, 247, 250);
        doc.rect(14, y, 182, 6.5, 'F');
      }

      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(b.stallNumber, 18, y + 4.5);

      doc.setFont('helvetica', 'normal');
      const displayName = `${b.exhibitorName}${b.stallName ? ` (${b.stallName})` : ''}`;
      const truncatedName = displayName.length > 38 ? displayName.substring(0, 36) + '..' : displayName;
      doc.text(truncatedName, 45, y + 4.5);

      doc.text(b.stallCategory || 'General', 125, y + 4.5);

      doc.setTextColor(180, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.text('BOOKED', 170, y + 4.5);

      y += 6.5;
    });
  }

  // Page 2: Layout Blueprint Floor Plan Image (Aspect Ratio strictly preserved!)
  if (event.layoutImageUrl) {
    try {
      const imgInfo = await loadImageDataUrl(event.layoutImageUrl);
      doc.addPage();

      // Blueprint Page Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`${event.name.toUpperCase()} - LAYOUT BLUEPRINT MAP`, 14, 13);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL EXHIBITION FLOOR PLAN & SEATING ARRANGEMENT', 14, 19);

      let pdfPageY = 28;

      // Status Badge Banner
      doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
      doc.roundedRect(14, pdfPageY, 182, 12, 2, 2, 'F');

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(
        `Total Stalls: ${stats.totalStalls}  |  Booked: ${stats.stallsBooked}  |  VACANT AVAILABLE NOW: ${stats.stallsAvailable} STALLS`,
        18,
        pdfPageY + 7.5
      );

      pdfPageY += 16;

      // Calculate perfect aspect ratio to fit inside printable box (182mm wide x 230mm high)
      const maxBoxW = 182;
      const maxBoxH = 230;
      const imgAspect = imgInfo.width / imgInfo.height;

      let renderW = maxBoxW;
      let renderH = maxBoxW / imgAspect;

      if (renderH > maxBoxH) {
        renderH = maxBoxH;
        renderW = maxBoxH * imgAspect;
      }

      // Center horizontally in 182mm box
      const renderX = 14 + (maxBoxW - renderW) / 2;
      const renderY = pdfPageY + (maxBoxH - renderH) / 2;

      doc.addImage(imgInfo.dataUrl, 'JPEG', renderX, renderY, renderW, renderH);
    } catch (err) {
      console.warn('Could not embed floor plan image in Vendor PDF:', err);
    }
  }

  // Footer divider line
  y += 4;
  if (y > 275) {
    doc.addPage();
    y = 15;
  }

  doc.setDrawColor(210, 194, 204);
  doc.line(14, y, 196, y);

  y += 5;
  doc.setTextColor(120, 110, 118);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `The Velvet Trunk Event Management  |  Vendor Blueprint & Availability Report  |  Page ${doc.getNumberOfPages()}`,
    14,
    y
  );

  // Save File
  const filename = `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_Vendor_Blueprint.pdf`;
  doc.save(filename);
};

// -----------------------------------------------------------------------------
// PDF EXPORT 2: FULL OWNER EXECUTIVE & FINANCIAL REPORT PDF (FOR OWNER / MANAGEMENT)
// -----------------------------------------------------------------------------
export const generateOwnerReportPDF = async (
  event: EventItem,
  bookings: VendorBooking[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const stats = calculateEventDashboardStats(event, bookings);
  const eventBookings = bookings.filter((b) => b.eventId === event.id);

  // Brand Colors
  const primaryColor = [73, 21, 70]; // #491546
  const secondaryColor = [144, 66, 119]; // #904277
  const darkTextColor = [30, 26, 29]; // #1e1a1d
  const lightBgColor = [250, 241, 245]; // #faf1f5

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(event.name.toUpperCase(), 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('THE VELVET TRUNK - OWNER EXECUTIVE & FINANCIAL LEDGER REPORT', 14, 22);
  doc.text(
    `Date: ${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`,
    145,
    22
  );

  let y = 38;

  // Event Meta Info Box
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Location:', 18, y + 7);
  doc.text('Exhibition Dates:', 18, y + 15);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(event.location, 48, y + 7);
  doc.text(
    `${formatDateRange(event.startDate, event.endDate)}${
      event.timing ? ` (${event.timing})` : ''
    }`,
    48,
    y + 15
  );

  y += 28;

  // Financial & Occupancy Section Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FINANCIAL & OCCUPANCY EXECUTIVE OVERVIEW', 14, y);

  y += 4;

  // 4 Financial Summary Stat Cards
  const cardWidth = 43;
  const cardGap = 3;
  const cards = [
    {
      title: 'Total Revenue Value',
      val: `Rs. ${stats.totalValue.toLocaleString('en-IN')}`,
    },
    {
      title: 'Advance Collected',
      val: `Rs. ${stats.totalCollected.toLocaleString('en-IN')}`,
    },
    {
      title: 'Pending Balance',
      val: `Rs. ${stats.totalPending.toLocaleString('en-IN')}`,
    },
    {
      title: 'Stall Occupancy',
      val: `${stats.stallsBooked} / ${stats.totalStalls} Booked`,
    },
  ];

  cards.forEach((card, idx) => {
    const x = 14 + idx * (cardWidth + cardGap);
    doc.setFillColor(245, 238, 242);
    doc.roundedRect(x, y, cardWidth, 16, 2, 2, 'F');

    doc.setFontSize(7);
    doc.setTextColor(120, 100, 115);
    doc.setFont('helvetica', 'bold');
    doc.text(card.title.toUpperCase(), x + 3.5, y + 5);

    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(card.val, x + 3.5, y + 12);
  });

  y += 22;

  // Status breakdown row
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(
    `Payment Status:  Paid: ${stats.paidCount} vendors  |  Partial: ${stats.partialCount} vendors  |  Unpaid: ${stats.unpaidCount} vendors`,
    14,
    y
  );

  y += 7;

  // Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`VENDOR FINANCIAL LEDGER (${eventBookings.length} BOOKINGS)`, 14, y);

  y += 4;

  // Table Header Fill
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(14, y, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  doc.text('Stall No', 16, y + 5.5);
  doc.text('Exhibitor / Stall Name', 35, y + 5.5);
  doc.text('Mobile', 95, y + 5.5);
  doc.text('Rent (Rs.)', 125, y + 5.5);
  doc.text('Advance (Rs.)', 148, y + 5.5);
  doc.text('Status', 175, y + 5.5);

  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  if (eventBookings.length === 0) {
    doc.setTextColor(120, 120, 120);
    doc.text('No vendor stall bookings recorded for this exhibition yet.', 16, y + 6);
    y += 10;
  } else {
    eventBookings.forEach((b, index) => {
      if (y > 270) {
        doc.addPage();
        y = 15;
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(14, y, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('Stall No', 16, y + 5.5);
        doc.text('Exhibitor / Stall Name', 35, y + 5.5);
        doc.text('Mobile', 95, y + 5.5);
        doc.text('Rent (Rs.)', 125, y + 5.5);
        doc.text('Advance (Rs.)', 148, y + 5.5);
        doc.text('Status', 175, y + 5.5);
        y += 8;
        doc.setFont('helvetica', 'normal');
      }

      if (index % 2 === 0) {
        doc.setFillColor(252, 247, 250);
        doc.rect(14, y, 182, 7, 'F');
      }

      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(b.stallNumber, 16, y + 5);

      doc.setFont('helvetica', 'normal');
      const displayName = `${b.exhibitorName} (${b.stallName})`;
      const truncatedName =
        displayName.length > 32 ? displayName.substring(0, 30) + '..' : displayName;
      doc.text(truncatedName, 35, y + 5);

      doc.text(b.mobileNumber, 95, y + 5);
      doc.text(b.stallRent.toLocaleString('en-IN'), 125, y + 5);
      doc.text(b.stallAdvance.toLocaleString('en-IN'), 148, y + 5);

      if (b.calculatedStatus === 'Paid') {
        doc.setTextColor(16, 122, 70);
      } else if (b.calculatedStatus === 'Partial') {
        doc.setTextColor(180, 100, 0);
      } else {
        doc.setTextColor(180, 20, 20);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(b.calculatedStatus, 175, y + 5);

      y += 7;
    });
  }

  // Embed Blueprint Floor Plan Image on Page 2 (Aspect Ratio strictly preserved!)
  if (event.layoutImageUrl) {
    try {
      const imgInfo = await loadImageDataUrl(event.layoutImageUrl);
      doc.addPage();

      // Blueprint Page Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`${event.name.toUpperCase()} - FLOOR PLAN BLUEPRINT`, 14, 13);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('EXHIBITION STALL LAYOUT MAP & SEATING ARRANGEMENT', 14, 19);

      let pdfPageY = 28;

      // Status Badge Banner
      doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
      doc.roundedRect(14, pdfPageY, 182, 12, 2, 2, 'F');

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(
        `Total Capacity: ${stats.totalStalls} Stalls  |  Booked: ${stats.stallsBooked}  |  AVAILABLE NOW: ${stats.stallsAvailable} STALLS`,
        18,
        pdfPageY + 7.5
      );

      pdfPageY += 16;

      // Calculate perfect aspect ratio to fit inside printable box (182mm wide x 230mm high)
      const maxBoxW = 182;
      const maxBoxH = 230;
      const imgAspect = imgInfo.width / imgInfo.height;

      let renderW = maxBoxW;
      let renderH = maxBoxW / imgAspect;

      if (renderH > maxBoxH) {
        renderH = maxBoxH;
        renderW = maxBoxH * imgAspect;
      }

      // Center horizontally in 182mm box
      const renderX = 14 + (maxBoxW - renderW) / 2;
      const renderY = pdfPageY + (maxBoxH - renderH) / 2;

      doc.addImage(imgInfo.dataUrl, 'JPEG', renderX, renderY, renderW, renderH);
    } catch (err) {
      console.warn('Could not embed floor plan image in Owner PDF:', err);
    }
  }

  // Footer divider line
  y += 4;
  if (y > 275) {
    doc.addPage();
    y = 15;
  }

  doc.setDrawColor(210, 194, 204);
  doc.line(14, y, 196, y);

  y += 5;
  doc.setTextColor(120, 110, 118);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `The Velvet Trunk Event Management  |  Owner Executive & Financial Report  |  Page ${doc.getNumberOfPages()}`,
    14,
    y
  );

  // Save File
  const filename = `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_Owner_Executive_Report.pdf`;
  doc.save(filename);
};

// Backwards compatibility default export
export const generateEventSummaryPDF = generateOwnerReportPDF;

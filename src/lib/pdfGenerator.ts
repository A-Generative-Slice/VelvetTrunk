import { jsPDF } from 'jspdf';
import { EventItem, VendorBooking } from '../types';
import { calculateEventDashboardStats, formatDateRange } from './storage';

// Helper to convert image URL to base64 Data URL for jsPDF embedding
export const loadImageDataUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!url) return reject('No URL provided');
    if (url.startsWith('data:image')) return resolve(url);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
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

// Generate Comprehensive PDF Report with Embedded Blueprint Floor Plan
export const generateEventSummaryPDF = async (
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
  doc.setFontSize(16);
  doc.text(event.name.toUpperCase(), 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('THE VELVET TRUNK - EXHIBITION SUMMARY & STALL BOOKINGS REPORT', 14, 23);
  doc.text(
    `Date: ${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`,
    145,
    23
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
  doc.text('FINANCIAL & OCCUPANCY OVERVIEW', 14, y);

  y += 4;

  // 4 Financial Summary Stat Cards
  const cardWidth = 43;
  const cardGap = 3;
  const cards = [
    {
      title: 'Total Occupancy',
      val: `${stats.stallsBooked} / ${stats.totalStalls}`,
    },
    { title: 'Available Stalls', val: `${stats.stallsAvailable} Remaining` },
    {
      title: 'Total Collected',
      val: `Rs. ${stats.totalCollected.toLocaleString('en-IN')}`,
    },
    {
      title: 'Pending Balance',
      val: `Rs. ${stats.totalPending.toLocaleString('en-IN')}`,
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
    `Collection Status:  Paid: ${stats.paidCount} vendors  |  Partial: ${stats.partialCount} vendors  |  Unpaid: ${stats.unpaidCount} vendors`,
    14,
    y
  );

  y += 7;

  // Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(
    `VENDOR BOOKINGS BREAKDOWN (${eventBookings.length} BOOKED)`,
    14,
    y
  );

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
    doc.text(
      'No vendor stall bookings recorded for this exhibition yet.',
      16,
      y + 6
    );
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
        displayName.length > 32
          ? displayName.substring(0, 30) + '..'
          : displayName;
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

  // Check if Floor Plan Layout Image exists and embed as blueprint page
  if (event.layoutImageUrl) {
    try {
      const imageDataUrl = await loadImageDataUrl(event.layoutImageUrl);
      doc.addPage();
      let pdfPageY = 12;

      // Blueprint Page Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(
        `${event.name.toUpperCase()} - FLOOR PLAN BLUEPRINT`,
        14,
        14
      );

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'EXHIBITION STALL LAYOUT MAP & SEATING ARRANGEMENT',
        14,
        21
      );

      pdfPageY = 32;

      // Status Badge Banner
      doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
      doc.roundedRect(14, pdfPageY, 182, 14, 2, 2, 'F');

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(
        `Total Capacity: ${stats.totalStalls} Stalls  |  Booked: ${stats.stallsBooked}  |  AVAILABLE NOW: ${stats.stallsAvailable} STALLS`,
        18,
        pdfPageY + 9
      );

      pdfPageY += 18;

      // Embed Blueprint Floor Plan Image onto Page
      doc.addImage(imageDataUrl, 'JPEG', 14, pdfPageY, 182, 220);
    } catch (err) {
      console.warn('Could not embed floor plan blueprint image in PDF:', err);
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
    `The Velvet Trunk Event Management  |  Exhibition Blueprint Report  |  Page ${doc.getNumberOfPages()}`,
    14,
    y
  );

  // Save File
  const filename = `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_Blueprint_Report.pdf`;
  doc.save(filename);
};

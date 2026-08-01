import { jsPDF } from 'jspdf';
import { EventItem, VendorBooking } from '../types';
import { calculateEventDashboardStats } from './storage';

export const generateEventSummaryPDF = (event: EventItem, bookings: VendorBooking[]) => {
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
  doc.text('THE VELVET TRUNK - EXHIBITION & BOOKINGS SUMMARY REPORT', 14, 23);
  doc.text(
    `Date: ${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`,
    150,
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
  doc.text(`${event.startDate} to ${event.endDate} (${event.timing})`, 48, y + 15);

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
    { title: 'Total Stalls', val: `${stats.stallsBooked} / ${stats.totalStalls}` },
    { title: 'Total Rent Value', val: `Rs. ${stats.totalValue.toLocaleString('en-IN')}` },
    { title: 'Total Collected', val: `Rs. ${stats.totalCollected.toLocaleString('en-IN')}` },
    { title: 'Pending Rent', val: `Rs. ${stats.totalPending.toLocaleString('en-IN')}` },
  ];

  cards.forEach((card, idx) => {
    const x = 14 + idx * (cardWidth + cardGap);
    doc.setFillColor(245, 238, 242);
    doc.roundedRect(x, y, cardWidth, 16, 2, 2, 'F');

    doc.setFontSize(7);
    doc.setTextColor(120, 100, 115);
    doc.setFont('helvetica', 'bold');
    doc.text(card.title.toUpperCase(), x + 3.5, y + 5);

    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(card.val, x + 3.5, y + 12);
  });

  y += 22;

  // Status breakdown row
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(
    `Collection Status:  Paid: ${stats.paidCount} vendors  |  Partial (Advance): ${stats.partialCount} vendors  |  Unpaid: ${stats.unpaidCount} vendors`,
    14,
    y
  );

  y += 7;

  // Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`VENDOR BOOKINGS BREAKDOWN (${eventBookings.length} TOTAL)`, 14, y);

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
      // Handle page overflow
      if (y > 270) {
        doc.addPage();
        y = 15;
        // Draw header on new page
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

      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(252, 247, 250);
        doc.rect(14, y, 182, 7, 'F');
      }

      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(b.stallNumber, 16, y + 5);

      doc.setFont('helvetica', 'normal');
      const displayName = `${b.exhibitorName} (${b.stallName})`;
      const truncatedName = displayName.length > 32 ? displayName.substring(0, 30) + '..' : displayName;
      doc.text(truncatedName, 35, y + 5);

      doc.text(b.mobileNumber, 95, y + 5);
      doc.text(b.stallRent.toLocaleString('en-IN'), 125, y + 5);
      doc.text(b.stallAdvance.toLocaleString('en-IN'), 148, y + 5);

      // Status styling
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
    `The Velvet Trunk Event Management System  |  Confidential Financial Summary  |  Page ${doc.getNumberOfPages()}`,
    14,
    y
  );

  // Save File
  const filename = `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_Summary.pdf`;
  doc.save(filename);
};

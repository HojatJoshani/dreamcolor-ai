import { jsPDF } from "jspdf";
import { ColoringPage } from "../types";

export const generatePDF = (childName: string, theme: string, pages: ColoringPage[]) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- COVER PAGE ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Title Border
  doc.setLineWidth(2);
  doc.setDrawColor(0, 0, 0);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  // Inner Border
  doc.setLineWidth(0.5);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.text("The Amazing", pageWidth / 2, 60, { align: "center" });
  
  doc.setFontSize(60);
  doc.setTextColor(0, 0, 0); // Black
  doc.text("Coloring Book", pageWidth / 2, 85, { align: "center" });
  
  doc.setFontSize(30);
  doc.setFont("helvetica", "normal");
  doc.text("Created especially for:", pageWidth / 2, 130, { align: "center" });
  
  doc.setFont("courier", "bold");
  doc.setFontSize(50);
  doc.text(childName.toUpperCase(), pageWidth / 2, 150, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(20);
  doc.text(`Theme: ${theme}`, pageWidth / 2, 200, { align: "center" });

  doc.setFontSize(12);
  doc.text("Powered by DreamColor AI", pageWidth / 2, 270, { align: "center" });

  // --- IMAGE PAGES ---
  pages.forEach((page, index) => {
    doc.addPage();
    
    // Add image
    // Note: jsPDF addImage supports base64 directly
    // Centering the image
    const imgMargin = 15;
    const imgWidth = pageWidth - (imgMargin * 2);
    const imgHeight = imgWidth; // Square images
    
    doc.addImage(page.url, "PNG", imgMargin, 40, imgWidth, imgHeight);

    // Add caption/description at bottom
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    // Wrap text
    const splitText = doc.splitTextToSize(page.originalDescription, pageWidth - 40);
    doc.text(splitText, pageWidth / 2, 40 + imgHeight + 20, { align: "center" });
    
    // Page number
    doc.setFontSize(10);
    doc.text(`Page ${index + 1}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  });

  doc.save(`${childName.replace(/\s+/g, '_')}_Coloring_Book.pdf`);
};

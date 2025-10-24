// Dynamic imports to avoid build issues
let jsPDF, html2canvas;

const loadPDFLibraries = async () => {
  if (!jsPDF) {
    jsPDF = (await import('jspdf')).default;
  }
  if (!html2canvas) {
    html2canvas = (await import('html2canvas')).default;
  }
  return { jsPDF, html2canvas };
};

/**
 * Generate PDF report from dashboard data
 * @param {Object} reportData - The data to include in the report
 * @param {string} reportTitle - Title of the report
 * @param {string} reportType - Type of report (dashboard, analytics, etc.)
 */
export const generatePDFReport = async (reportData, reportTitle = 'Management Report', reportType = 'dashboard') => {
  try {
    // Load PDF libraries dynamically
    const { jsPDF: PDF, html2canvas: canvas } = await loadPDFLibraries();
    
    // Create new PDF document
    const pdf = new PDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set font
    pdf.setFont('helvetica');
    
    // Add header with logo and title
    await addHeader(pdf, reportTitle, pageWidth);
    
    // Add report content based on type
    switch (reportType) {
      case 'dashboard':
        await addDashboardContent(pdf, reportData, pageWidth, pageHeight);
        break;
      case 'analytics':
        await addAnalyticsContent(pdf, reportData, pageWidth);
        break;
      case 'performance':
        await addPerformanceContent(pdf, reportData, pageWidth);
        break;
      default:
        await addGenericContent(pdf, reportData, pageWidth);
    }
    
    // Add footer
    addFooter(pdf, pageWidth, pageHeight);
    
    // Save the PDF
    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add header to PDF
 */
const addHeader = async (pdf, title, pageWidth) => {
  try {
    // Add real logo image
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    // Load the logo image
    await new Promise((resolve, reject) => {
      logoImg.onload = resolve;
      logoImg.onerror = reject;
      logoImg.src = '/logo-light.jpg'; // Use the real logo
    });
    
    // Add logo to PDF (25x15mm size)
    pdf.addImage(logoImg, 'JPEG', 15, 10, 25, 15);
    
  } catch (error) {
    console.error('Error loading logo, using fallback:', error);
    // Fallback to simple logo if image fails to load
    pdf.setFillColor(52, 152, 219); // Professional blue color
    pdf.rect(15, 10, 25, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('E', 27, 20, { align: 'center' });
  }
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Add title with better spacing
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Add subtitle
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Management Reporting Dashboard', pageWidth / 2, 26, { align: 'center' });
  
  // Add report ID for tracking
  pdf.text(`Report ID: ${Date.now()}`, pageWidth - 15, 26, { align: 'right' });
  
  // Add horizontal line with better color
  pdf.setDrawColor(220, 220, 220);
  pdf.line(15, 32, pageWidth - 15, 32);
  
  // Add company info
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text('educoreAI Management Reporting System', 15, 38);
};

/**
 * Add dashboard content to PDF
 */
const addDashboardContent = async (pdf, data, pageWidth, pageHeight) => {
  let yPosition = 45; // Start after header
  
  // Add summary section with better spacing
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Executive Summary', 15, yPosition);
  yPosition += 12;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  if (data.summary) {
    const summaryText = data.summary;
    const lines = pdf.splitTextToSize(summaryText, pageWidth - 30);
    pdf.text(lines, 15, yPosition);
    yPosition += lines.length * 5 + 15; // More spacing between sections
  }
  
  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = 20;
  }
  
  // Add key metrics with better formatting
  if (data.metrics) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Key Metrics', 15, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Create a table-like layout for metrics
    const metricsEntries = Object.entries(data.metrics);
    const colWidth = (pageWidth - 30) / 2;
    let currentCol = 0;
    
    metricsEntries.forEach(([key, value], index) => {
      const xPos = 15 + (currentCol * colWidth);
      
      // Add background for each metric
      pdf.setFillColor(248, 249, 250);
      pdf.rect(xPos, yPosition - 3, colWidth - 5, 8, 'F');
      
      // Add metric text
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(key, xPos + 2, yPosition + 2);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(String(value), xPos + 2, yPosition + 5);
      
      currentCol++;
      if (currentCol >= 2) {
        currentCol = 0;
        yPosition += 12;
        
        // Check if we need a new page
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }
      }
    });
    
    // If we have odd number of metrics, move to next line
    if (metricsEntries.length % 2 !== 0) {
      yPosition += 12;
    }
    
    yPosition += 15; // Extra spacing after metrics
  }
  
  // Check if we need a new page before charts
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = 20;
  }
  
  // Add charts if available
  if (data.charts && data.charts.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Charts & Visualizations', 15, yPosition);
    yPosition += 8;
    
    for (const chart of data.charts) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(chart.title, 15, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Type: ${chart.type}`, 15, yPosition);
      yPosition += 5;
      
      if (chart.description) {
        const descLines = pdf.splitTextToSize(chart.description, pageWidth - 30);
        pdf.text(descLines, 15, yPosition);
        yPosition += descLines.length * 4 + 5;
      }
      
      yPosition += 10;
    }
  }
};

/**
 * Add analytics content to PDF
 */
const addAnalyticsContent = async (pdf, data, pageWidth) => {
  let yPosition = 40;
  
  // Add analytics summary
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analytics Report', 15, yPosition);
  yPosition += 10;
  
  // Data Table section removed as requested
};

/**
 * Add performance content to PDF
 */
const addPerformanceContent = async (pdf, data, pageWidth) => {
  let yPosition = 40;
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Performance Report', 15, yPosition);
  yPosition += 10;
  
  if (data.performanceData) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Performance Metrics', 15, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    Object.entries(data.performanceData).forEach(([metric, value]) => {
      pdf.text(`${metric}: ${value}`, 20, yPosition);
      yPosition += 5;
    });
  }
};

/**
 * Add generic content to PDF
 */
const addGenericContent = async (pdf, data, pageWidth) => {
  let yPosition = 40;
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Report Data', 15, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  if (typeof data === 'object') {
    const dataString = JSON.stringify(data, null, 2);
    const lines = pdf.splitTextToSize(dataString, pageWidth - 30);
    pdf.text(lines, 15, yPosition);
  } else {
    pdf.text(String(data), 15, yPosition);
  }
};

/**
 * Add footer to PDF
 */
const addFooter = (pdf, pageWidth, pageHeight) => {
  const pageCount = pdf.internal.getNumberOfPages();
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString();
  const timeString = currentDate.toLocaleTimeString();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Add page number
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pageHeight - 10);
    
    // Add company info
    pdf.text('educoreAI Management Reporting', 15, pageHeight - 10);
    
    // Add generation date and time on the last page only
    if (i === pageCount) {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${dateString} at ${timeString}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  }
};

/**
 * Enhanced PDF generator that includes chart images
 * @param {Object} reportData - The data to include in the report
 * @param {string} reportTitle - Title of the report
 * @param {Array} chartElements - Array of chart element IDs to capture
 */
export const generateEnhancedPDF = async (reportData, reportTitle = 'Report', chartElements = []) => {
  try {
    // Load PDF libraries dynamically
    const { jsPDF: PDF, html2canvas: canvas } = await loadPDFLibraries();
    
    // Create new PDF document
    const pdf = new PDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set font
    pdf.setFont('helvetica');
    
    // Add header
    await addHeader(pdf, reportTitle, pageWidth);
    
    let yPosition = 45; // Start after header
    
    // Add summary with better spacing
    if (reportData.summary) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Executive Summary', 15, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(reportData.summary, pageWidth - 30);
      pdf.text(summaryLines, 15, yPosition);
      yPosition += summaryLines.length * 4 + 15; // More spacing
      
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 20;
      }
    }
    
    // Add metrics with better formatting
    if (reportData.metrics) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Key Metrics', 15, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Create a table-like layout for metrics
      const metricsEntries = Object.entries(reportData.metrics);
      const colWidth = (pageWidth - 30) / 2;
      let currentCol = 0;
      
      metricsEntries.forEach(([key, value], index) => {
        const xPos = 15 + (currentCol * colWidth);
        
        // Add background for each metric
        pdf.setFillColor(248, 249, 250);
        pdf.rect(xPos, yPosition - 3, colWidth - 5, 8, 'F');
        
        // Add metric text
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text(key, xPos + 2, yPosition + 2);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(String(value), xPos + 2, yPosition + 5);
        
        currentCol++;
        if (currentCol >= 2) {
          currentCol = 0;
          yPosition += 12;
          
          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = 20;
          }
        }
      });
      
      // If we have odd number of metrics, move to next line
      if (metricsEntries.length % 2 !== 0) {
        yPosition += 12;
      }
      
      yPosition += 15; // Extra spacing after metrics
    }
    
    // Check if we need a new page before charts
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Add chart images with better spacing
    if (chartElements && chartElements.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Charts & Visualizations', 15, yPosition);
      yPosition += 12;
      
      for (const chartId of chartElements) {
        try {
          const chartElement = document.getElementById(chartId);
          if (chartElement) {
            // Check if we need a new page
            if (yPosition > pageHeight - 100) {
              pdf.addPage();
              yPosition = 20;
            }
            
            // Add chart title
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Chart: ${chartId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`, 15, yPosition);
            yPosition += 8;
            
            // Capture chart as image
            const chartCanvas = await canvas(chartElement, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              width: chartElement.scrollWidth,
              height: chartElement.scrollHeight
            });
            
            const imgData = chartCanvas.toDataURL('image/png');
            
            // Calculate dimensions to fit the image
            const imgWidth = chartCanvas.width;
            const imgHeight = chartCanvas.height;
            const maxWidth = pageWidth - 30;
            const maxHeight = 80; // Increased max height for charts
            const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
            const finalWidth = imgWidth * ratio;
            const finalHeight = imgHeight * ratio;
            
            // Add the image to PDF
            pdf.addImage(imgData, 'PNG', 15, yPosition, finalWidth, finalHeight);
            yPosition += finalHeight + 15; // More spacing after chart
            
            // Check if we need a new page after adding the chart
            if (yPosition > pageHeight - 50) {
              pdf.addPage();
              yPosition = 20;
            }
          }
        } catch (error) {
          console.error(`Error capturing chart ${chartId}:`, error);
          // Continue with other charts
        }
      }
    }
    
    // Data Table section removed as requested
    
    // Add footer
    addFooter(pdf, pageWidth, pageHeight);
    
    // Save the PDF
    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

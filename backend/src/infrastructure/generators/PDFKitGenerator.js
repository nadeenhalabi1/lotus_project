import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import { IPDFGenerator } from '../../domain/ports/IPDFGenerator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PDFKitGenerator extends IPDFGenerator {
  async generate(reportData, chartImages = {}, chartNarrations = {}) {
    return new Promise((resolve, reject) => {
      try {
        console.log('[PDFKit] Starting report PDF generation');
        
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4'
        });
        
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          console.log(`[PDFKit] Report PDF generated successfully, size: ${pdfBuffer.length} bytes`);
          resolve(pdfBuffer);
        });
        doc.on('error', (error) => {
          console.error('[PDFKit] PDF generation error:', error);
          reject(error);
        });
        
        let currentY = 50;
        
        // Header with logo
        currentY = this.addReportHeader(doc, reportData, currentY);
        currentY += 30;
        
        // Executive Summary
        if (reportData.executiveSummary) {
          currentY = this.addExecutiveSummary(doc, reportData.executiveSummary, currentY);
          currentY += 20;
        }
        
        // AI Insights
        if (reportData.aiInsights) {
          currentY = this.addAIInsights(doc, reportData.aiInsights, currentY);
          currentY += 20;
        }
        
        // Charts
        if (reportData.charts && reportData.charts.length > 0) {
          currentY = this.addChartsSection(doc, reportData.charts, chartImages, chartNarrations, currentY);
          currentY += 20;
        }
        
        // Data Table - REMOVED per user request
        
        // Footer
        this.addFooter(doc);
        
        doc.end();
      } catch (error) {
        console.error('[PDFKit] Error generating report PDF:', error);
        reject(error);
      }
    });
  }

  async generateChartPDF(chart, chartImageBase64 = null) {
    return new Promise((resolve, reject) => {
      try {
        console.log('[PDFKit] Starting PDF generation for chart:', chart.title);
        console.log('[PDFKit] Chart image provided:', chartImageBase64 ? 'Yes' : 'No');
        
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4'
        });
        
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          console.log(`[PDFKit] PDF generated successfully, size: ${pdfBuffer.length} bytes`);
          resolve(pdfBuffer);
        });
        doc.on('error', (error) => {
          console.error('[PDFKit] PDF generation error:', error);
          reject(error);
        });
        
        // Track current Y position
        let currentY = 50;
        
        // Header with logo
        const headerHeight = this.addHeader(doc, chart, currentY);
        currentY = headerHeight + 20; // Add spacing after header
        
        // Title
        doc.fontSize(24)
           .fillColor('#10b981')
           .text(chart.title || 'Chart Report', 50, currentY, {
             width: doc.page.width - 100,
             align: 'center'
           });
        currentY += 35;
        
        // Subtitle
        if (chart.subtitle) {
          doc.fontSize(14)
             .fillColor('#666666')
             .text(chart.subtitle, 50, currentY, {
               width: doc.page.width - 100,
               align: 'center'
             });
          currentY += 25;
        }
        
        // Description
        if (chart.description) {
          doc.fontSize(11)
             .fillColor('#333333')
             .text(chart.description, 50, currentY, {
               width: doc.page.width - 100,
               align: 'left'
             });
          // Estimate height: ~15px per line, max 3 lines
          const estimatedLines = Math.min(Math.ceil(chart.description.length / 80), 3);
          currentY += (estimatedLines * 15) + 15;
        }
        
        // Generation date
        const creationDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        doc.fontSize(10)
           .fillColor('#888888')
           .text(`Generated: ${creationDate}`, 50, currentY, {
             width: doc.page.width - 100,
             align: 'right'
           });
        currentY += 20;
        
        // Chart image section (if provided)
        if (chartImageBase64) {
          try {
            console.log('[PDFKit] Adding chart image to PDF...');
            
            // Check if we need a new page for image
            if (currentY > doc.page.height - 450) {
              doc.addPage();
              currentY = 50;
            }
            
            // Section title
            doc.fontSize(16)
               .fillColor('#10b981')
               .text('Chart Visualization', 50, currentY, {
                 width: doc.page.width - 100
               });
            currentY += 25;
            
            // Remove data URL prefix if present
            const base64Data = chartImageBase64.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            
            // Calculate image dimensions to fit page width
            const maxWidth = doc.page.width - 100; // Leave margins
            const maxHeight = 300; // Reduced height to prevent issues
            
            // Add image at specific position
            doc.image(imageBuffer, 50, currentY, {
              fit: [maxWidth, maxHeight],
              align: 'center'
            });
            
            // Update Y position after image (use actual height or max)
            currentY += maxHeight + 20;
            console.log('[PDFKit] Chart image added successfully');
          } catch (imageError) {
            console.warn('[PDFKit] Failed to add chart image:', imageError.message);
            // Continue without image
          }
        }
        
        // Check if we need a new page before chart info
        if (currentY > doc.page.height - 250) {
          doc.addPage();
          currentY = 50;
        }
        
        // Chart info section
        doc.fontSize(16)
           .fillColor('#10b981')
           .text('Chart Information', 50, currentY, {
             width: doc.page.width - 100
           });
        currentY += 25;
        
        doc.fontSize(11)
           .fillColor('#333333');
        
        const infoLines = [
          `Chart Type: ${chart.type || 'N/A'}`,
          `Data Points: ${chart.data?.length || 0}`,
          chart.metadata?.service ? `Service: ${chart.metadata.service}` : null,
          chart.metadata?.source ? `Data Source: ${chart.metadata.source}` : null,
          chart.metadata?.lastUpdated ? `Last Updated: ${new Date(chart.metadata.lastUpdated).toLocaleString()}` : null
        ].filter(Boolean);
        
        infoLines.forEach(line => {
          doc.text(line, 50, currentY, {
            width: doc.page.width - 100
          });
          currentY += 18;
        });
        
        currentY += 15;
        
        // Check if we need a new page before data table
        if (currentY > doc.page.height - 250) {
          doc.addPage();
          currentY = 50;
        }
        
        // Data table
        if (chart.data && Array.isArray(chart.data) && chart.data.length > 0) {
          doc.fontSize(16)
             .fillColor('#10b981')
             .text('Data Table', 50, currentY, {
               width: doc.page.width - 100
             });
          currentY += 25;
          
          this.addDataTable(doc, chart.data, currentY);
        }
        
        // Footer - will be added manually on each page
        // Don't use pageAdded event to avoid stack overflow
        
        doc.end();
      } catch (error) {
        console.error('[PDFKit] Error generating PDF:', error);
        reject(error);
      }
    });
  }

  addHeader(doc, chart, startY) {
    let currentY = startY;
    
    // Try to load logo
    const possiblePaths = [
      path.join(process.cwd(), 'backend', 'logo', 'logo-light.jpg'),
      path.join(process.cwd(), 'frontend', 'src', 'assets', 'images', 'logo-light.jpg'),
      path.join(process.cwd(), 'logo', 'logo-light.jpg'),
    ];
    
    let logoPath = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        logoPath = possiblePath;
        break;
      }
    }
    
    if (logoPath) {
      try {
        doc.image(logoPath, 50, currentY, { width: 50, height: 50 });
      } catch (error) {
        console.warn('[PDFKit] Could not load logo:', error.message);
      }
    }
    
    // Title next to logo
    doc.fontSize(18)
       .fillColor('#333333')
       .text(chart.title || 'Chart Report', logoPath ? 110 : 50, currentY + 15, {
         width: doc.page.width - (logoPath ? 160 : 100),
         align: logoPath ? 'left' : 'center'
       });
    
    // Date below title
    const creationDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.fontSize(10)
       .fillColor('#888888')
       .text(`Generated: ${creationDate}`, 50, currentY + 50, {
         width: doc.page.width - 100,
         align: 'right'
       });
    
    // Line separator
    const separatorY = currentY + 70;
    doc.moveTo(50, separatorY)
       .lineTo(doc.page.width - 50, separatorY)
       .strokeColor('#10b981')
       .lineWidth(2)
       .stroke();
    
    return separatorY;
  }

  addDataTable(doc, data, startY) {
    if (!data || data.length === 0) return;
    
    const firstItem = data[0];
    const dataKeys = Object.keys(firstItem).filter(key => key !== 'name');
    
    // Table header
    let currentY = startY;
    const rowHeight = 25;
    const colWidth = (doc.page.width - 100) / (dataKeys.length + 1);
    
    // Calculate how many rows fit on current page
    const availableHeight = doc.page.height - currentY - 100; // Leave space for footer
    const maxRowsOnPage = Math.floor(availableHeight / rowHeight) - 1; // -1 for header
    const maxRows = Math.min(data.length, maxRowsOnPage, 30); // Limit to 30 rows to prevent issues
    
    // Helper function to draw header
    const drawHeader = (y) => {
      // Header background
      doc.rect(50, y, doc.page.width - 100, rowHeight)
         .fillColor('#10b981')
         .fill();
      
      // Header text
      doc.fontSize(11)
         .fillColor('#ffffff')
         .font('Helvetica-Bold');
      
      doc.text('Name', 55, y + 7, { width: colWidth - 10 });
      dataKeys.forEach((key, index) => {
        const x = 55 + (colWidth * (index + 1));
        doc.text(this.formatKey(key), x, y + 7, { width: colWidth - 10 });
      });
      
      // Reset font
      doc.font('Helvetica')
         .fillColor('#333333')
         .fontSize(10);
    };
    
    // Draw initial header
    drawHeader(currentY);
    currentY += rowHeight;
    
    // Table rows - only show rows that fit on current page
    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      const item = data[rowIndex];
      
      // Stop if we're running out of space
      if (currentY + rowHeight > doc.page.height - 100) {
        break;
      }
      
      // Alternate row background
      if (rowIndex % 2 === 0) {
        doc.rect(50, currentY, doc.page.width - 100, rowHeight)
           .fillColor('#f9f9f9')
           .fill();
      }
      
      // Row border
      doc.rect(50, currentY, doc.page.width - 100, rowHeight)
         .strokeColor('#dddddd')
         .lineWidth(0.5)
         .stroke();
      
      // Cell content
      doc.fillColor('#333333');
      doc.text(item.name || 'N/A', 55, currentY + 7, { width: colWidth - 10 });
      
      dataKeys.forEach((key, colIndex) => {
        const x = 55 + (colWidth * (colIndex + 1));
        const value = item[key] !== undefined ? item[key] : 'N/A';
        const formattedValue = typeof value === 'number' 
          ? value.toLocaleString() 
          : String(value);
        doc.text(formattedValue, x, currentY + 7, { width: colWidth - 10 });
      });
      
      currentY += rowHeight;
    }
    
    // If there are more rows, add a note
    if (data.length > maxRows) {
      if (currentY + 30 > doc.page.height - 100) {
        // Skip note if no space
      } else {
        doc.fontSize(10)
           .fillColor('#888888')
           .text(`Note: Showing first ${maxRows} of ${data.length} rows`, 50, currentY, {
             width: doc.page.width - 100,
             align: 'center'
           });
      }
    }
    
    // Add footer
    doc.fontSize(8)
       .fillColor('#999999')
       .text('Management Reporting System', 50, doc.page.height - 50, {
         align: 'center',
         width: doc.page.width - 100
       });
  }

  formatKey(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  addReportHeader(doc, reportData, startY) {
    let currentY = startY;
    
    // Try to load logo
    const possiblePaths = [
      path.join(process.cwd(), 'backend', 'logo', 'logo-light.jpg'),
      path.join(process.cwd(), 'frontend', 'src', 'assets', 'images', 'logo-light.jpg'),
      path.join(process.cwd(), 'logo', 'logo-light.jpg'),
    ];
    
    let logoPath = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        logoPath = possiblePath;
        break;
      }
    }
    
    if (logoPath) {
      try {
        doc.image(logoPath, 50, currentY, { width: 50, height: 50 });
      } catch (error) {
        console.warn('[PDFKit] Could not load logo:', error.message);
      }
    }
    
    // Title
    const title = reportData.executiveSummary?.title || 'Management Report';
    doc.fontSize(24)
       .fillColor('#10b981')
       .font('Helvetica-Bold')
       .text(title, logoPath ? 110 : 50, currentY + 10, {
         width: doc.page.width - (logoPath ? 160 : 100),
         align: logoPath ? 'left' : 'center'
       });
    
    // Date
    const creationDate = new Date(reportData.generatedAt || Date.now()).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.fontSize(10)
       .fillColor('#888888')
       .font('Helvetica')
       .text(`Generated: ${creationDate}`, 50, currentY + 50, {
         width: doc.page.width - 100,
         align: 'right'
       });
    
    // Line separator
    const separatorY = currentY + 70;
    doc.moveTo(50, separatorY)
       .lineTo(doc.page.width - 50, separatorY)
       .strokeColor('#10b981')
       .lineWidth(2)
       .stroke();
    
    return separatorY + 20;
  }

  addExecutiveSummary(doc, summary, startY) {
    let currentY = startY;
    
    // Section title
    doc.fontSize(18)
       .fillColor('#10b981')
       .font('Helvetica-Bold')
       .text('Executive Summary', 50, currentY);
    currentY += 25;
    
    // Key metrics grid
    if (summary.keyMetrics) {
      const metrics = Object.entries(summary.keyMetrics);
      const metricsPerRow = 3;
      const metricWidth = (doc.page.width - 100) / metricsPerRow;
      const metricHeight = 50;
      
      for (let i = 0; i < Math.min(metrics.length, 9); i++) {
        const [key, value] = metrics[i];
        const row = Math.floor(i / metricsPerRow);
        const col = i % metricsPerRow;
        const x = 50 + (col * metricWidth);
        const y = currentY + (row * metricHeight);
        
        // Check if we need a new page
        if (y + metricHeight > doc.page.height - 100) {
          doc.addPage();
          currentY = 50;
          const newRow = Math.floor(i / metricsPerRow);
          const newY = currentY + (newRow * metricHeight);
          this.addMetricBox(doc, key, value, x, newY, metricWidth - 10);
        } else {
          this.addMetricBox(doc, key, value, x, y, metricWidth - 10);
        }
      }
      
      currentY += (Math.ceil(Math.min(metrics.length, 9) / metricsPerRow) * metricHeight) + 20;
    }
    
    return currentY;
  }

  addMetricBox(doc, key, value, x, y, width) {
    // Box background
    doc.rect(x, y, width, 45)
       .fillColor('#f9fafb')
       .fill()
       .strokeColor('#e5e7eb')
       .lineWidth(1)
       .stroke();
    
    // Key (label)
    doc.fontSize(9)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text(this.formatKey(key), x + 5, y + 5, {
         width: width - 10
       });
    
    // Value
    const formattedValue = typeof value === 'number' 
      ? value.toLocaleString() 
      : String(value);
    doc.fontSize(16)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text(formattedValue, x + 5, y + 20, {
         width: width - 10
       });
  }

  addAIInsights(doc, insights, startY) {
    let currentY = startY;
    
    // Check if we need a new page
    if (currentY > doc.page.height - 300) {
      doc.addPage();
      currentY = 50;
    }
    
    // Section title
    doc.fontSize(18)
       .fillColor('#10b981')
       .font('Helvetica-Bold')
       .text('Chart Summary (AI-Generated)', 50, currentY);
    currentY += 30;
    
    // Observations
    if (insights.observations) {
      currentY = this.addInsightBox(doc, 'Key Observations', insights.observations, '#3b82f6', currentY);
      currentY += 15;
    }
    
    // Trends
    if (insights.trends) {
      currentY = this.addInsightBox(doc, 'Trends', insights.trends, '#10b981', currentY);
      currentY += 15;
    }
    
    // Anomalies
    if (insights.anomalies) {
      currentY = this.addInsightBox(doc, 'Anomalies', insights.anomalies, '#f59e0b', currentY);
      currentY += 15;
    }
    
    // Recommendations
    if (insights.recommendations) {
      currentY = this.addInsightBox(doc, 'Recommendations', insights.recommendations, '#8b5cf6', currentY);
      currentY += 15;
    }
    
    return currentY;
  }

  addInsightBox(doc, title, text, color, startY) {
    let currentY = startY;
    
    // Check if we need a new page
    if (currentY > doc.page.height - 150) {
      doc.addPage();
      currentY = 50;
    }
    
    // Box with colored border
    const boxHeight = Math.min(80, Math.ceil(text.length / 80) * 15 + 30);
    
    // Colored left border
    doc.rect(50, currentY, 4, boxHeight)
       .fillColor(color)
       .fill();
    
    // Background
    doc.rect(54, currentY, doc.page.width - 104, boxHeight)
       .fillColor(this.getLightColor(color))
       .fill();
    
    // Title
    doc.fontSize(12)
       .fillColor(this.getDarkColor(color))
       .font('Helvetica-Bold')
       .text(title, 60, currentY + 8, {
         width: doc.page.width - 120
       });
    
    // Text
    doc.fontSize(10)
       .fillColor('#374151')
       .font('Helvetica')
       .text(text, 60, currentY + 25, {
         width: doc.page.width - 120,
         align: 'left'
       });
    
    return currentY + boxHeight;
  }

  getLightColor(color) {
    const colorMap = {
      '#3b82f6': '#dbeafe', // Blue
      '#10b981': '#d1fae5', // Green
      '#f59e0b': '#fef3c7', // Amber
      '#8b5cf6': '#ede9fe'  // Purple
    };
    return colorMap[color] || '#f9fafb';
  }

  getDarkColor(color) {
    const colorMap = {
      '#3b82f6': '#1e40af', // Blue
      '#10b981': '#065f46', // Green
      '#f59e0b': '#92400e', // Amber
      '#8b5cf6': '#5b21b6'  // Purple
    };
    return colorMap[color] || '#111827';
  }

  addChartsSection(doc, charts, chartImages, chartNarrations, startY) {
    let currentY = startY;
    
    // Section title
    doc.fontSize(18)
       .fillColor('#10b981')
       .font('Helvetica-Bold')
       .text('Supporting Charts', 50, currentY);
    currentY += 30;
    
    for (let i = 0; i < charts.length; i++) {
      const chart = charts[i];
      
      // Check if we need a new page
      if (currentY > doc.page.height - 400) {
        doc.addPage();
        currentY = 50;
      }
      
      // Chart title
      doc.fontSize(14)
         .fillColor('#111827')
         .font('Helvetica-Bold')
         .text(chart.title || `Chart ${i + 1}`, 50, currentY);
      currentY += 20;
      
      // Chart subtitle
      if (chart.subtitle) {
        doc.fontSize(10)
           .fillColor('#6b7280')
           .font('Helvetica')
           .text(chart.subtitle, 50, currentY);
        currentY += 15;
      }
      
      // Chart image
      const chartImage = chartImages[chart.id] || chartImages[i];
      if (chartImage) {
        try {
          const base64Data = chartImage.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');
          
          const maxWidth = doc.page.width - 100;
          const maxHeight = 250;
          
          doc.image(imageBuffer, 50, currentY, {
            fit: [maxWidth, maxHeight],
            align: 'center'
          });
          
          currentY += maxHeight + 15;
          
          // Add chart narration if available
          const narration = chartNarrations[chart.id] || chartNarrations[i];
          if (narration) {
            // Check if we need a new page for narration
            if (currentY > doc.page.height - 150) {
              doc.addPage();
              currentY = 50;
            }
            
            // Narration title
            doc.fontSize(12)
               .fillColor('#10b981')
               .font('Helvetica-Bold')
               .text('Chart Summary (AI-Generated)', 50, currentY);
            currentY += 20;
            
            // Narration text
            doc.fontSize(10)
               .fillColor('#374151')
               .font('Helvetica')
               .text(narration, 50, currentY, {
                 width: doc.page.width - 100,
                 align: 'left',
                 lineGap: 3
               });
            
            // Calculate narration height
            const narrationHeight = doc.heightOfString(narration, {
              width: doc.page.width - 100,
              lineGap: 3
            });
            currentY += narrationHeight + 20;
          }
        } catch (imageError) {
          console.warn(`[PDFKit] Failed to add chart image for ${chart.id}:`, imageError.message);
          // Add placeholder text
          doc.fontSize(10)
             .fillColor('#9ca3af')
             .text('Chart visualization not available', 50, currentY);
          currentY += 20;
        }
      } else {
        // No image available
        doc.fontSize(10)
           .fillColor('#9ca3af')
           .text('Chart visualization not available', 50, currentY);
        currentY += 20;
      }
      
      // Chart description
      if (chart.description) {
        doc.fontSize(9)
           .fillColor('#6b7280')
           .font('Helvetica')
           .text(chart.description, 50, currentY, {
             width: doc.page.width - 100
           });
        const estimatedLines = Math.ceil(chart.description.length / 100);
        currentY += (estimatedLines * 12) + 15;
      }
      
      currentY += 10; // Spacing between charts
    }
    
    return currentY;
  }

  addReportDataTable(doc, dataTable, startY) {
    let currentY = startY;
    
    // Check if we need a new page
    if (currentY > doc.page.height - 200) {
      doc.addPage();
      currentY = 50;
    }
    
    // Section title
    doc.fontSize(18)
       .fillColor('#10b981')
       .font('Helvetica-Bold')
       .text('Data Summary', 50, currentY);
    currentY += 25;
    
    if (!dataTable.headers || !dataTable.rows || dataTable.rows.length === 0) {
      return currentY;
    }
    
    const headers = dataTable.headers;
    const rows = dataTable.rows;
    const colCount = headers.length;
    const colWidth = (doc.page.width - 100) / colCount;
    const rowHeight = 25;
    
    // Calculate how many rows fit
    const availableHeight = doc.page.height - currentY - 100;
    const maxRowsOnPage = Math.floor(availableHeight / rowHeight) - 1;
    const maxRows = Math.min(rows.length, maxRowsOnPage, 30);
    
    // Header
    doc.rect(50, currentY, doc.page.width - 100, rowHeight)
       .fillColor('#10b981')
       .fill();
    
    doc.fontSize(11)
       .fillColor('#ffffff')
       .font('Helvetica-Bold');
    
    headers.forEach((header, index) => {
      doc.text(header, 55 + (index * colWidth), currentY + 7, {
        width: colWidth - 10
      });
    });
    
    doc.font('Helvetica')
       .fillColor('#333333')
       .fontSize(10);
    
    currentY += rowHeight;
    
    // Rows
    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      if (currentY + rowHeight > doc.page.height - 100) {
        break;
      }
      
      const row = rows[rowIndex];
      
      // Alternate row background
      if (rowIndex % 2 === 0) {
        doc.rect(50, currentY, doc.page.width - 100, rowHeight)
           .fillColor('#f9fafb')
           .fill();
      }
      
      // Row border
      doc.rect(50, currentY, doc.page.width - 100, rowHeight)
         .strokeColor('#e5e7eb')
         .lineWidth(0.5)
         .stroke();
      
      // Cell content
      row.forEach((cell, cellIndex) => {
        const x = 55 + (cellIndex * colWidth);
        const value = typeof cell === 'number' 
          ? cell.toLocaleString() 
          : String(cell);
        doc.text(value, x, currentY + 7, {
          width: colWidth - 10
        });
      });
      
      currentY += rowHeight;
    }
    
    if (rows.length > maxRows) {
      doc.fontSize(9)
         .fillColor('#9ca3af')
         .text(`Note: Showing first ${maxRows} of ${rows.length} rows`, 50, currentY, {
           width: doc.page.width - 100,
           align: 'center'
         });
    }
    
    return currentY;
  }

  addFooter(doc) {
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text('Management Reporting System - EducoreAI', 50, doc.page.height - 50, {
         align: 'center',
         width: doc.page.width - 100
       });
  }
}


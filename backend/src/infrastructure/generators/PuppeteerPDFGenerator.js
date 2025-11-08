import puppeteer from 'puppeteer';
import { IPDFGenerator } from '../../domain/ports/IPDFGenerator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PuppeteerPDFGenerator extends IPDFGenerator {
  async generate(reportData) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Generate HTML from report data
      const html = this.generateHTML(reportData);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '1.5cm',
          right: '1.5cm',
          bottom: '1.5cm',
          left: '1.5cm'
        },
        printBackground: true
      });

      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async generateChartPDF(chart) {
    let browser;
    try {
      console.log('[PDF Generator] Launching browser...');
      
      // Windows-compatible Puppeteer configuration
      const isWindows = process.platform === 'win32';
      const launchArgs = [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu'
      ];
      
      // Don't use --single-process on Windows as it can cause issues
      if (!isWindows) {
        launchArgs.push('--no-zygote', '--single-process');
      }
      
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: launchArgs,
          timeout: 30000,
          // Use system Chrome if available on Windows
          executablePath: isWindows ? undefined : undefined
        });
        console.log('[PDF Generator] Browser launched successfully');
      } catch (launchError) {
        console.error('[PDF Generator] Browser launch failed:', launchError);
        console.error('[PDF Generator] Launch error details:', {
          message: launchError.message,
          name: launchError.name,
          stack: launchError.stack
        });
        
        // Try with different configuration
        console.log('[PDF Generator] Retrying with minimal args...');
        try {
          browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: 30000
          });
          console.log('[PDF Generator] Browser launched with minimal args');
        } catch (retryError) {
          console.error('[PDF Generator] Retry also failed:', retryError);
          throw new Error(`Failed to launch browser: ${launchError.message}. Retry also failed: ${retryError.message}`);
        }
      }

      console.log('[PDF Generator] Browser launched, creating page...');
      let page;
      try {
        page = await browser.newPage();
        console.log('[PDF Generator] Page created successfully');
      } catch (pageError) {
        console.error('[PDF Generator] Failed to create page:', pageError);
        throw new Error(`Failed to create browser page: ${pageError.message}`);
      }
      
      // Get logo path - try to find logo-light.jpg
      let logoPath = null;
      
      // Try multiple possible locations for the logo
      const possiblePaths = [
        path.join(process.cwd(), 'frontend', 'src', 'assets', 'images', 'logo-light.jpg'),
        path.join(process.cwd(), 'backend', 'logo', 'logo-light.jpg'),
        path.join(process.cwd(), 'logo', 'logo-light.jpg'),
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          logoPath = possiblePath;
          console.log(`[PDF Generator] Logo found at: ${logoPath}`);
          break;
        }
      }
      
      if (!logoPath) {
        console.warn('[PDF Generator] Logo not found, PDF will be generated without logo');
      }
      
      // Generate HTML from chart data with logo path
      console.log('[PDF Generator] Generating HTML...');
      let html;
      try {
        html = this.generateChartHTML(chart, logoPath);
        console.log(`[PDF Generator] HTML generated, length: ${html.length} characters`);
      } catch (htmlError) {
        console.error('[PDF Generator] Failed to generate HTML:', htmlError);
        throw new Error(`Failed to generate HTML: ${htmlError.message}`);
      }
      
      console.log('[PDF Generator] Setting page content...');
      try {
        await page.setContent(html, { 
          waitUntil: 'networkidle0',
          timeout: 30000
        });
        console.log('[PDF Generator] Page content set successfully');
      } catch (contentError) {
        console.error('[PDF Generator] Failed to set page content:', contentError);
        throw new Error(`Failed to set page content: ${contentError.message}`);
      }
      
      console.log('[PDF Generator] Generating PDF...');
      // Generate PDF
      let pdf;
      try {
        pdf = await page.pdf({
          format: 'A4',
          margin: {
            top: '1.5cm',
            right: '1.5cm',
            bottom: '1.5cm',
            left: '1.5cm'
          },
          printBackground: true,
          timeout: 30000
        });
        console.log(`[PDF Generator] PDF generated successfully, size: ${pdf.length} bytes`);
      } catch (pdfError) {
        console.error('[PDF Generator] Failed to generate PDF:', pdfError);
        console.error('[PDF Generator] PDF error details:', {
          message: pdfError.message,
          name: pdfError.name,
          stack: pdfError.stack
        });
        throw new Error(`Failed to generate PDF: ${pdfError.message}`);
      }

      if (!pdf || pdf.length === 0) {
        throw new Error('Generated PDF is empty');
      }

      return pdf;
    } catch (error) {
      console.error('[PDF Generator] Chart PDF generation error:', error);
      console.error('[PDF Generator] Error stack:', error.stack);
      throw error;
    } finally {
      if (browser) {
        try {
          await browser.close();
          console.log('[PDF Generator] Browser closed');
        } catch (closeError) {
          console.warn('[PDF Generator] Error closing browser:', closeError.message);
        }
      }
    }
  }

  generateChartHTML(chart, logoPath = null) {
    // Convert chart data to table format
    const getTableData = () => {
      if (!chart || !chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
        return null;
      }

      const firstItem = chart.data[0];
      const dataKeys = Object.keys(firstItem).filter(key => key !== 'name');
      
      if (dataKeys.length === 1 && dataKeys[0] === 'value') {
        return {
          headers: ['Name', 'Value'],
          rows: chart.data.map(item => [item.name || 'N/A', item.value || 0])
        };
      }

      return {
        headers: ['Name', ...dataKeys],
        rows: chart.data.map(item => [
          item.name || 'N/A',
          ...dataKeys.map(key => item[key] !== undefined ? item[key] : 'N/A')
        ])
      };
    };

    const tableData = getTableData();
    const formatDateTime = (value) => {
      if (!value) return 'Unknown';
      const date = new Date(value);
      return date.toLocaleString();
    };
    
    const creationDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Convert logo to base64 if path exists
    let logoBase64 = null;
    if (logoPath) {
      try {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64String = logoBuffer.toString('base64');
        const logoExtension = logoPath.split('.').pop().toLowerCase();
        logoBase64 = `data:image/${logoExtension === 'jpg' ? 'jpeg' : logoExtension};base64,${logoBase64String}`;
      } catch (error) {
        console.warn('Could not load logo for PDF:', error.message);
      }
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
      padding-top: 10px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .logo-img {
      height: 50px;
      width: auto;
      max-width: 150px;
    }
    .header-content {
      flex: 1;
    }
    .header-title {
      font-size: 22px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .header-date {
      font-size: 12px;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 15px;
      border-bottom: 2px solid #10b981;
      padding-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 11px;
      page-break-inside: auto;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #10b981;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    .chart-info {
      background-color: #f5f5f5;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .chart-info-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    .chart-info-details {
      font-size: 13px;
      color: #666;
      line-height: 1.8;
    }
    .chart-info-details strong {
      color: #333;
    }
    .metadata {
      font-size: 11px;
      color: #666;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }
    .footer {
      position: fixed;
      bottom: 0;
      width: 100%;
      text-align: center;
      font-size: 9px;
      color: #999;
      padding-top: 10px;
      border-top: 1px solid #eee;
      background-color: white;
    }
    @media print {
      .footer {
        position: fixed;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="logo-img" />` : ''}
      <div class="header-content">
        <div class="header-title">${chart.title || 'Chart Report'}</div>
        <div class="header-date">Generated: ${creationDate}</div>
      </div>
    </div>
  </div>

  ${chart.subtitle ? `
  <div class="section">
    <div style="font-size: 16px; color: #666; margin-bottom: 10px;">
      ${chart.subtitle}
    </div>
  </div>
  ` : ''}

  ${chart.description ? `
  <div class="section">
    <div style="font-size: 14px; color: #888; margin-bottom: 20px;">
      ${chart.description}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Chart Visualization</div>
    <div class="chart-info">
      <div class="chart-info-title">${chart.title || 'Chart'}</div>
      <div class="chart-info-details">
        <strong>Chart Type:</strong> ${chart.type || 'N/A'}<br/>
        <strong>Data Points:</strong> ${chart.data?.length || 0}<br/>
        ${chart.metadata?.service ? `<strong>Service:</strong> ${chart.metadata.service}<br/>` : ''}
        ${chart.metadata?.source ? `<strong>Data Source:</strong> ${chart.metadata.source}<br/>` : ''}
        <strong>Last Updated:</strong> ${formatDateTime(chart.metadata?.lastUpdated)}
      </div>
      ${tableData && tableData.rows.length > 0 ? `
      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
        <strong style="font-size: 14px; color: #333; display: block; margin-bottom: 10px;">Preview Data:</strong>
        <div style="font-size: 11px; color: #666;">
          ${tableData.rows.slice(0, 5).map((row, idx) => 
            `${idx + 1}. ${row[0]}: ${typeof row[1] === 'number' ? row[1].toLocaleString() : row[1]}`
          ).join('<br/>')}
          ${tableData.rows.length > 5 ? `<br/><em>... and ${tableData.rows.length - 5} more items</em>` : ''}
        </div>
      </div>
      ` : ''}
    </div>
    <p style="font-size: 11px; color: #888; font-style: italic; margin-top: 10px;">
      Note: For interactive chart visualization, please use the web interface. The complete data is available in the table below.
    </p>
  </div>

  ${tableData ? `
  <div class="section">
    <div class="section-title">Complete Data Table</div>
    <table>
      <thead>
        <tr>
          ${tableData.headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${tableData.rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${typeof cell === 'number' ? cell.toLocaleString() : cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="footer">
    Management Reporting System | Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
  </div>
</body>
</html>
    `;
  }

  generateHTML(reportData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #10b981;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #10b981;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #10b981;
      color: white;
    }
    .footer {
      position: fixed;
      bottom: 0;
      width: 100%;
      text-align: center;
      font-size: 10px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">EducoreAI</div>
    <div>Management Reporting</div>
  </div>

  <div class="section">
    <div class="section-title">Executive Summary</div>
    <p>${JSON.stringify(reportData.executiveSummary, null, 2)}</p>
  </div>

  ${reportData.charts && reportData.charts.length > 0 ? `
  <div class="section">
    <div class="section-title">Key Visual Charts</div>
    <p>Charts would be rendered here in production</p>
  </div>
  ` : ''}

  ${reportData.dataTable ? `
  <div class="section">
    <div class="section-title">Detailed Data Table</div>
    <table>
      <thead>
        <tr>
          ${reportData.dataTable.headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${reportData.dataTable.rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${reportData.aiInsights ? `
  <div class="section">
    <div class="section-title">AI Insights & Recommendations</div>
    <p><strong>Observations:</strong> ${reportData.aiInsights.observations || 'N/A'}</p>
    <p><strong>Trends:</strong> ${reportData.aiInsights.trends || 'N/A'}</p>
    <p><strong>Anomalies:</strong> ${reportData.aiInsights.anomalies || 'N/A'}</p>
    <p><strong>Recommendations:</strong> ${reportData.aiInsights.recommendations || 'N/A'}</p>
  </div>
  ` : ''}

  <div class="footer">
    Generated on ${new Date().toLocaleDateString()} | Page <span class="pageNumber"></span>
  </div>
</body>
</html>
    `;
  }
}


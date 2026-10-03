const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// 1. Read Logo
const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
let logoBase64 = '';
if (fs.existsSync(logoPath)) {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Southern Spoon POS - Product Overview & Commercial Proposal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      font-size: 9.5pt;
      line-height: 1.45;
    }

    .page {
      width: 210mm;
      height: 297mm;
      position: relative;
      padding: 18mm 20mm 16mm 20mm;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
      overflow: hidden;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Ambient Background Elements */
    .page-accent-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #d97706 0%, #f59e0b 35%, #0284c7 100%);
    }

    .page-watermark {
      position: absolute;
      bottom: 40mm;
      right: -20mm;
      font-size: 140pt;
      font-weight: 900;
      color: #f1f5f9;
      z-index: 0;
      pointer-events: none;
      user-select: none;
      line-height: 1;
      opacity: 0.7;
    }

    .content-layer {
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 20px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      object-fit: cover;
    }

    .brand-text h1 {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .brand-text p {
      font-size: 8pt;
      font-weight: 600;
      color: #d97706;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .doc-meta {
      text-align: right;
    }

    .doc-meta .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      font-size: 7.5pt;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .doc-meta .date {
      font-size: 8pt;
      color: #64748b;
      margin-top: 4px;
    }

    /* Footer */
    .page-footer {
      position: relative;
      z-index: 1;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5pt;
      color: #64748b;
    }

    .page-footer .page-number {
      font-weight: 600;
      color: #0f172a;
    }

    /* Typography Utilities */
    .hero-title {
      font-size: 23pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 8px;
    }

    .hero-title span {
      background: linear-gradient(120deg, #d97706, #b45309);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 10pt;
      color: #475569;
      line-height: 1.5;
      margin-bottom: 22px;
      max-width: 95%;
    }

    .section-heading {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .section-heading .pill {
      width: 4px;
      height: 18px;
      background: #f59e0b;
      border-radius: 2px;
    }

    .section-heading h2 {
      font-size: 11.5pt;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .section-heading p {
      font-size: 7.5pt;
      color: #64748b;
      margin-left: auto;
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .feature-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 9px 12px;
      position: relative;
    }

    .feature-card.highlight {
      background: #fefce8;
      border-color: #fde047;
    }

    .feature-icon-title {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 6px;
    }

    .icon-box {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11pt;
      background: #ffffff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.04);
      border: 1px solid #e2e8f0;
    }

    .feature-icon-title h3 {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }

    .feature-card p {
      font-size: 8pt;
      color: #475569;
      line-height: 1.45;
    }

    .feature-card ul {
      margin-top: 6px;
      padding-left: 14px;
      font-size: 7.8pt;
      color: #334155;
    }

    .feature-card ul li {
      margin-bottom: 3px;
    }

    /* Metric Banners */
    .metrics-banner {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #0f172a;
      border-radius: 12px;
      padding: 14px 16px;
      color: #ffffff;
      margin-bottom: 20px;
    }

    .metric-item {
      border-right: 1px solid #334155;
      padding-right: 10px;
    }

    .metric-item:last-child {
      border-right: none;
      padding-right: 0;
    }

    .metric-val {
      font-size: 14pt;
      font-weight: 800;
      color: #fbbf24;
      font-family: 'JetBrains Mono', monospace;
    }

    .metric-lbl {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-top: 2px;
      font-weight: 600;
    }

    /* Comparison & Pricing */
    .pricing-container {
      display: grid;
      grid-template-columns: 1fr 1.08fr;
      gap: 16px;
      margin-top: 10px;
      align-items: stretch;
    }

    .pricing-card {
      border-radius: 14px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
    }

    .pricing-card.premium {
      background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
      border: 2px solid #f59e0b;
      box-shadow: 0 10px 25px rgba(245, 158, 11, 0.12);
    }

    .popular-tag {
      position: absolute;
      top: -11px;
      right: 20px;
      background: linear-gradient(90deg, #d97706, #f59e0b);
      color: #ffffff;
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 3px 12px;
      border-radius: 20px;
      box-shadow: 0 2px 6px rgba(217, 119, 6, 0.3);
    }

    .plan-header {
      margin-bottom: 12px;
    }

    .plan-title {
      font-size: 12pt;
      font-weight: 800;
      color: #0f172a;
    }

    .plan-subtitle {
      font-size: 8pt;
      color: #64748b;
      margin-top: 2px;
    }

    .price-block {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin: 12px 0 14px 0;
    }

    .price-curr {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
    }

    .price-amount {
      font-size: 24pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.03em;
      font-family: 'JetBrains Mono', monospace;
    }

    .price-term {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
    }

    .savings-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 7.5pt;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin-bottom: 16px;
    }

    .plan-features li {
      font-size: 8pt;
      color: #334155;
      margin-bottom: 7px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .plan-features li .check {
      color: #10b981;
      font-weight: 800;
      font-size: 9pt;
    }

    .btn-placeholder {
      display: block;
      width: 100%;
      text-align: center;
      padding: 9px;
      border-radius: 8px;
      font-size: 8.5pt;
      font-weight: 700;
      text-decoration: none;
    }

    .btn-outline {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      color: #334155;
    }

    .btn-solid {
      background: #d97706;
      border: 1.5px solid #d97706;
      color: #ffffff;
    }

    /* Comparison Table */
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 8pt;
    }

    .specs-table th {
      background: #f1f5f9;
      text-align: left;
      padding: 5px 8px;
      color: #334155;
      font-weight: 700;
      border-bottom: 2px solid #cbd5e1;
    }

    .specs-table td {
      padding: 5px 8px;
      border-bottom: 1px solid #f1f5f9;
      color: #475569;
    }

    .specs-table tr:nth-child(even) td {
      background: #fafafa;
    }

    .specs-table td.strong {
      font-weight: 600;
      color: #0f172a;
    }

    .tag-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 6.8pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .tag-green { background: #dcfce7; color: #15803d; }
    .tag-amber { background: #fef3c7; color: #b45309; }
    .tag-blue { background: #e0f2fe; color: #0369a1; }

    .callout-box {
      background: #f8fafc;
      border-left: 4px solid #f59e0b;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      margin: 12px 0;
    }

    .callout-box h4 {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .callout-box p {
      font-size: 7.8pt;
      color: #475569;
      line-height: 1.4;
    }

    /* Flow Graphic */
    .workflow-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
      margin: 14px 0;
    }

    .workflow-step {
      text-align: center;
      flex: 1;
    }

    .step-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7.5pt;
      font-weight: 700;
      margin: 0 auto 4px auto;
    }

    .step-name {
      font-size: 7.5pt;
      font-weight: 700;
      color: #0f172a;
    }

    .step-desc {
      font-size: 6.8pt;
      color: #64748b;
    }

    .workflow-arrow {
      color: #cbd5e1;
      font-size: 11pt;
      font-weight: bold;
      padding: 0 6px;
    }
  </style>
</head>
<body>

  <!-- ===================================================================== -->
  <!-- PAGE 1: EXECUTIVE OVERVIEW & ARCHITECTURAL FOUNDATION                 -->
  <!-- ===================================================================== -->
  <div class="page">
    <div class="page-accent-top"></div>
    <div class="page-watermark">POS</div>

    <div class="content-layer">
      <!-- Top Brand Header -->
      <div class="header-bar">
        <div class="brand-group">
          ${logoBase64 ? `<img src="${logoBase64}" class="brand-logo" alt="Logo" />` : ''}
          <div class="brand-text">
            <h1>Southern Spoon POS</h1>
            <p>High-Performance Restaurant POS System</p>
          </div>
        </div>
        <div class="doc-meta">
          <span class="badge">Commercial Proposal & Specs</span>
          <div class="date">Edition: 2026 / 2027 • Labuduwa, Galle</div>
        </div>
      </div>

      <!-- Hero Header -->
      <div class="hero-title">
        The Rock-Solid POS Built for <span>Speed, Zero Downtime & High Profits</span>.
      </div>
      <div class="hero-subtitle">
        Engineered specifically for busy Sri Lankan restaurants, cafes, and multi-station kitchens. Combining desktop-grade speed with local SQLite persistence and live Google Sheets cloud synchronization — guaranteeing non-stop operations even when your internet drops.
      </div>

      <!-- 4 Core Metrics -->
      <div class="metrics-banner">
        <div class="metric-item">
          <div class="metric-val">100%</div>
          <div class="metric-lbl">Offline-First Uptime</div>
        </div>
        <div class="metric-item">
          <div class="metric-val">&lt; 0.1s</div>
          <div class="metric-lbl">Instant Billing Latency</div>
        </div>
        <div class="metric-item">
          <div class="metric-val">Dual</div>
          <div class="metric-lbl">Receipt &amp; Kitchen KOT</div>
        </div>
        <div class="metric-item">
          <div class="metric-val">Live</div>
          <div class="metric-lbl">Cloud Google Sync</div>
        </div>
      </div>

      <!-- Section: Why Solid? -->
      <div class="section-heading">
        <div class="pill"></div>
        <h2>Why Southern Spoon POS Outperforms Cloud-Only Systems</h2>
        <p>Architectural Superiority</p>
      </div>

      <div class="grid-2">
        <div class="feature-card highlight">
          <div class="feature-icon-title">
            <div class="icon-box">⚡</div>
            <h3>100% Zero-Latency Offline Independence</h3>
          </div>
          <p>
            Unlike web-based POS software that stalls or crashes whenever Dialog, Mobitel, or SLT fiber experiences outages, Southern Spoon POS runs directly on your local Windows PC with SQLite local persistence. Orders are created, settled, and printed with instantaneous speed, zero loading spinners, and total privacy.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-title">
            <div class="icon-box">☁️</div>
            <h3>Live Cloud Mirroring (Owner Mobile Dashboard)</h3>
          </div>
          <p>
            You get the reliability of local hardware PLUS the freedom of cloud monitoring. Every settled bill automatically syncs in real-time to your secure Google Sheet. Track live itemized portions, daily revenue, and payment breakdowns directly from your smartphone wherever you are in the world.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-title">
            <div class="icon-box">🖨️</div>
            <h3>Direct ESC/POS Thermal Printing &amp; Drawer Kick</h3>
          </div>
          <p>
            Native raw ESC/POS integration for standard 80mm and 58mm thermal receipt printers. Automatically pulses the 24V RJ11 solenoid to pop open the cash drawer immediately upon cash settlement. Includes station-routed Kitchen Order Tickets (KOT) for direct chef dispatch.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-title">
            <div class="icon-box">🛡️</div>
            <h3>Shift Audits &amp; Anti-Theft Security</h3>
          </div>
          <p>
            Prevent cashier revenue leaks with mid-shift X-Reports, blind cash drawer closing declarations, automated over/short calculation in end-of-day Z-Reports, and master PIN security on discounts, voids, drawer kicks, and menu price modifications.
          </p>
        </div>
      </div>

      <!-- Quick Operational Flow -->
      <div class="workflow-strip">
        <div class="workflow-step">
          <div class="step-circle">1</div>
          <div class="step-name">Punch Order</div>
          <div class="step-desc">Portion / Steppers / Notes</div>
        </div>
        <div class="workflow-arrow">→</div>
        <div class="workflow-step">
          <div class="step-circle">2</div>
          <div class="step-name">Kitchen KOT</div>
          <div class="step-desc">Auto-routes to Wok/Bar</div>
        </div>
        <div class="workflow-arrow">→</div>
        <div class="workflow-step">
          <div class="step-circle">3</div>
          <div class="step-name">Quick Settlement</div>
          <div class="step-desc">Cash notes / Card / LankaQR</div>
        </div>
        <div class="workflow-arrow">→</div>
        <div class="workflow-step">
          <div class="step-circle">4</div>
          <div class="step-name">Print &amp; Kick Drawer</div>
          <div class="step-desc">Thermal slip + RJ11 pulse</div>
        </div>
        <div class="workflow-arrow">→</div>
        <div class="workflow-step">
          <div class="step-circle">5</div>
          <div class="step-name">Owner Cloud Sync</div>
          <div class="step-desc">Instant Google Sheet update</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="page-footer">
      <span>Southern Spoon POS System • Confidential Commercial Proposal</span>
      <span class="page-number">Page 1 of 3</span>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- PAGE 2: DEEP DIVE INTO MODULES & POWERFUL CAPABILITIES                -->
  <!-- ===================================================================== -->
  <div class="page">
    <div class="page-accent-top"></div>
    <div class="page-watermark">FEATURES</div>

    <div class="content-layer">
      <!-- Header -->
      <div class="header-bar">
        <div class="brand-group">
          ${logoBase64 ? `<img src="${logoBase64}" class="brand-logo" alt="Logo" />` : ''}
          <div class="brand-text">
            <h1>Comprehensive Features &amp; Modules</h1>
            <p>Every tool your restaurant staff and management need</p>
          </div>
        </div>
        <div class="doc-meta">
          <span class="badge">Functional Matrix</span>
          <div class="date">Edition: 2026 / 2027</div>
        </div>
      </div>

      <!-- Feature Grid: 6 Pillars -->
      <div class="section-heading">
        <div class="pill"></div>
        <h2>The 6 Pillars of Operational Excellence</h2>
        <p>Built for Speed &amp; Accuracy</p>
      </div>

      <div class="grid-2" style="gap: 12px;">
        <!-- 1. Billing -->
        <div class="feature-card">
          <div class="feature-icon-title">
            <div class="icon-box">⚡</div>
            <h3>1. Speed-Touch Order Terminal</h3>
          </div>
          <ul>
            <li><strong>Portion Architecture:</strong> Full and Half portion selection with automatic variant pricing.</li>
            <li><strong>Fast Counter Steppers:</strong> Instant <code>+1</code>, <code>+2</code>, <code>+5</code> buttons for fast-moving items like Short Eats, Soft Drinks, and Cigarettes (Dunhill, Gold Leaf).</li>
            <li><strong>Custom Kitchen Directives:</strong> Preset modifiers (Extra Spicy, Less Chili, Sunny Egg on top) + freeform special request notes.</li>
            <li><strong>Dynamic Search &amp; Category Filters:</strong> Instant search by Sinhala or English name; categorized tabs with intuitive iconography.</li>
          </ul>
        </div>

        <!-- 2. Hardware -->
        <div class="feature-card">
          <div class="feature-icon-title">
            <div class="icon-box">🖨️</div>
            <h3>2. Hardware &amp; Thermal Printing</h3>
          </div>
          <ul>
            <li><strong>Thermal Receipt Engine:</strong> Clean 80mm &amp; 58mm layouts with restaurant header, hotline, VAT/tax details, and customer Wi-Fi credentials.</li>
            <li><strong>Multi-Station KOT Dispatch:</strong> Smartly categorizes and tags food tickets for <code>Wok Station</code>, <code>Kottu Griddle</code>, <code>Beverage Bar</code>, and <code>Curry Counter</code>.</li>
            <li><strong>RJ11 Cash Drawer Auto-Kick:</strong> Sends hardware solenoid trigger pulse (<code>ESC p 0 25 250</code>) on cash settlement.</li>
            <li><strong>On-Screen Thermal Previewer:</strong> Inspect receipt formatting and reprints directly in the UI before cutting paper.</li>
          </ul>
        </div>

        <!-- 3. Tables & Zones -->
        <div class="feature-card">
          <div class="feature-icon-title">
            <div class="icon-box">🪑</div>
            <h3>3. Table &amp; Dining Floor Engine</h3>
          </div>
          <ul>
            <li><strong>3-Zone Visual Layout:</strong> Courtyard Garden, Main Dining Hall, and AC Lounge.</li>
            <li><strong>Isolated Table Sessions:</strong> Keep tabs open for dining parties, continuously add courses, and view running bill total and seated duration timer.</li>
            <li><strong>Flexible Channels:</strong> Instant toggle between <em>Dine-In</em>, <em>Takeaway</em>, and <em>Delivery</em> orders with zero confusion.</li>
            <li><strong>Occupancy Status:</strong> Real-time color indicators: Vacant (Emerald), Occupied (Amber), Billed (Cyan).</li>
          </ul>
        </div>

        <!-- 4. Payments -->
        <div class="feature-card">
          <div class="feature-icon-title">
            <div class="icon-box">💳</div>
            <h3>4. Sri Lankan Currency Cashier Desk</h3>
          </div>
          <ul>
            <li><strong>One-Tap Tender Buttons:</strong> <code>+Rs. 5,000</code>, <code>+Rs. 2,000</code>, <code>+Rs. 1,000</code>, <code>+Rs. 500</code>, <code>+Rs. 100</code>, and <code>Exact Amount</code>.</li>
            <li><strong>Zero-Error Balance Calculation:</strong> Displays change due in large high-contrast numerals to eliminate manual arithmetic errors.</li>
            <li><strong>Multi-Payment Readiness:</strong> Seamlessly split or switch between Cash, Visa/Mastercard (with terminal auth ref), and LankaQR.</li>
            <li><strong>Discounts &amp; Charges:</strong> Configurable percentage/fixed bill discounts with service charge toggle.</li>
          </ul>
        </div>

        <!-- 5. Shifts & Audit -->
        <div class="feature-card">
          <div class="feature-icon-title">
            <div class="icon-box">📊</div>
            <h3>5. Shift Balancing &amp; Fiscal X/Z Reports</h3>
          </div>
          <ul>
            <li><strong>Morning Opening Float:</strong> Cashier registers starting cash float with timestamp verification.</li>
            <li><strong>Mid-Shift X-Report:</strong> Instant audit slip showing sales-to-moment without closing register.</li>
            <li><strong>End-of-Day Z-Report:</strong> Blind cash drawer declaration; POS compares physical count against expected cash and prints official Over/Short audit slips.</li>
            <li><strong>Historical Shift Archive:</strong> Complete record of past cashier registers and reconciliations.</li>
          </ul>
        </div>

        <!-- 6. Cloud & Security -->
        <div class="feature-card">
          <div class="feature-icon-title">
            <div class="icon-box">🔐</div>
            <h3>6. Anti-Theft Security &amp; Live Cloud Sync</h3>
          </div>
          <ul>
            <li><strong>Master PIN Protection (9001):</strong> Protects menu price changes, cash drawer manual open, voided orders, and shift closures.</li>
            <li><strong>Price Audit Trail:</strong> Logs old price, new price, date, and cashier identity on any price modification.</li>
            <li><strong>Live Google Sheets Sync:</strong> Automated background POST of itemized sales (Item name, portion, quantity, bill total, running cumulative sum).</li>
            <li><strong>Excel / CSV Data Export:</strong> One-click export for accountants and tax auditors.</li>
          </ul>
        </div>
      </div>

      <!-- Hardware Specs Table -->
      <div class="section-heading" style="margin-top: 14px;">
        <div class="pill"></div>
        <h2>System Compatibility &amp; Requirements</h2>
      </div>

      <table class="specs-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Supported Specifications</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="strong">Computer / POS Terminal</td>
            <td>Windows 10, Windows 11 (64-bit). PC, Laptop, All-in-One Touch POS (Core i3/i5, 4GB+ RAM)</td>
            <td><span class="tag-badge tag-green">Fully Compatible</span></td>
          </tr>
          <tr>
            <td class="strong">Thermal Printers</td>
            <td>Any standard ESC/POS USB or Serial Printer (80mm / 58mm). Epson, Xprinter, Rongta, Bixolon, Sunmi</td>
            <td><span class="tag-badge tag-green">Native Support</span></td>
          </tr>
          <tr>
            <td class="strong">Cash Drawers</td>
            <td>Standard 12V / 24V RJ11 interface connected to thermal receipt printer</td>
            <td><span class="tag-badge tag-green">Auto-Kick</span></td>
          </tr>
          <tr>
            <td class="strong">Network &amp; Internet</td>
            <td>Operates 100% offline. Internet (Wi-Fi/LAN/Dongle) only needed for Google Sheets live syncing</td>
            <td><span class="tag-badge tag-blue">Offline-First</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="page-footer">
      <span>Southern Spoon POS System • Technical Specifications</span>
      <span class="page-number">Page 2 of 3</span>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- PAGE 3: COMMERCIAL PRICING, VALUE PROPOSITION & ONBOARDING            -->
  <!-- ===================================================================== -->
  <div class="page">
    <div class="page-accent-top"></div>
    <div class="page-watermark">PRICING</div>

    <div class="content-layer">
      <!-- Header -->
      <div class="header-bar">
        <div class="brand-group">
          ${logoBase64 ? `<img src="${logoBase64}" class="brand-logo" alt="Logo" />` : ''}
          <div class="brand-text">
            <h1>Investment &amp; Licensing Plans</h1>
            <p>Simple, transparent, and high-return pricing with zero hidden fees</p>
          </div>
        </div>
        <div class="doc-meta">
          <span class="badge">Official Pricing</span>
          <div class="date">Valid: 2026 / 2027</div>
        </div>
      </div>

      <!-- Value Statement -->
      <div class="callout-box">
        <h4>High Return on Investment (ROI)</h4>
        <p>
          By preventing kitchen billing omissions, stopping unauthorized cash drawer access, and speeding up table turnover during peak rush hours, this system typically saves mid-sized restaurants over <strong>Rs. 25,000 – Rs. 50,000 per month</strong> in recovered revenue.
        </p>
      </div>

      <!-- Pricing Plans -->
      <div class="pricing-container">
        <!-- Monthly Plan -->
        <div class="pricing-card">
          <div>
            <div class="plan-header">
              <div class="plan-title">Monthly Flex Plan</div>
              <div class="plan-subtitle">Ideal for new startups &amp; seasonal operations</div>
            </div>

            <div class="price-block">
              <span class="price-curr">LKR</span>
              <span class="price-amount">5,000</span>
              <span class="price-term">/ month</span>
            </div>

            <p style="font-size: 8pt; color: #64748b; margin-bottom: 14px;">
              Pay month-to-month with total flexibility. Cancel or upgrade anytime with zero penalties.
            </p>

            <ul class="plan-features">
              <li><span class="check">✓</span> Complete Offline POS System &amp; Desktop App</li>
              <li><span class="check">✓</span> 80mm &amp; 58mm ESC/POS Thermal Printing</li>
              <li><span class="check">✓</span> RJ11 Cash Drawer Auto-Kick Integration</li>
              <li><span class="check">✓</span> Kitchen KOT Station Routing (Wok/Bar)</li>
              <li><span class="check">✓</span> Live Google Sheets Cloud Mirroring</li>
              <li><span class="check">✓</span> Shift Management, X-Reports &amp; Z-Reports</li>
              <li><span class="check">✓</span> Standard Technical Support (9 AM – 6 PM)</li>
            </ul>
          </div>

          <div>
            <div class="btn-placeholder btn-outline">Select Monthly Plan</div>
          </div>
        </div>

        <!-- Annual Plan (Recommended) -->
        <div class="pricing-card premium">
          <div class="popular-tag">MOST POPULAR • SAVE 33%</div>
          <div>
            <div class="plan-header">
              <div class="plan-title">Annual Enterprise Plan</div>
              <div class="plan-subtitle">Maximum value, peace of mind &amp; VIP support</div>
            </div>

            <div class="price-block">
              <span class="price-curr">LKR</span>
              <span class="price-amount">40,000</span>
              <span class="price-term">/ year</span>
            </div>

            <div class="savings-badge">
              🎉 Instant Savings of LKR 20,000 / Year (Only ~3,333 LKR/mo)
            </div>

            <ul class="plan-features">
              <li><span class="check">✓</span> <strong>Everything included in the Monthly Plan</strong></li>
              <li><span class="check">✓</span> <strong>1 Full Year of Unlimited Licensing &amp; Usage</strong></li>
              <li><span class="check">✓</span> <strong>Free Initial Menu Setup &amp; Custom Category Configuration</strong></li>
              <li><span class="check">✓</span> <strong>Priority 24/7 Phone &amp; Remote WhatsApp Support</strong></li>
              <li><span class="check">✓</span> <strong>On-Site or Remote Staff Cashier Training</strong></li>
              <li><span class="check">✓</span> <strong>Free Software Updates, Feature Enhancements &amp; Patches</strong></li>
              <li><span class="check">✓</span> <strong>Guaranteed Renewal Price Lock for 2 Years</strong></li>
            </ul>
          </div>

          <div>
            <div class="btn-placeholder btn-solid">Choose Annual Plan (Recommended)</div>
          </div>
        </div>
      </div>

      <!-- What's Included / Onboarding Next Steps -->
      <div class="section-heading" style="margin-top: 18px;">
        <div class="pill"></div>
        <h2>Fast 3-Step Deployment &amp; Handover</h2>
        <p>Zero Downtime Transition</p>
      </div>

      <div class="grid-3" style="gap: 10px;">
        <div class="feature-card" style="padding: 10px 12px;">
          <h3 style="font-size: 8.8pt; color: #0f172a; margin-bottom: 4px;">Step 1: Setup &amp; Menu Load</h3>
          <p style="font-size: 7.6pt; color: #475569;">
            We install the desktop system on your POS PC, load your complete food &amp; beverage menu with portion pricing, and configure your Google Sheets cloud sync.
          </p>
        </div>

        <div class="feature-card" style="padding: 10px 12px;">
          <h3 style="font-size: 8.8pt; color: #0f172a; margin-bottom: 4px;">Step 2: Hardware Pairing</h3>
          <p style="font-size: 7.6pt; color: #475569;">
            We calibrate your 80mm/58mm thermal printers, test KOT kitchen dispatch, set up the cash drawer kick solenoid pulse, and verify custom receipt headers.
          </p>
        </div>

        <div class="feature-card" style="padding: 10px 12px;">
          <h3 style="font-size: 8.8pt; color: #0f172a; margin-bottom: 4px;">Step 3: Cashier Training</h3>
          <p style="font-size: 7.6pt; color: #475569;">
            A quick 30-minute interactive cashier and manager training session covering speed billing, shift opening floats, discounts, and day-end Z-Report balancing.
          </p>
        </div>
      </div>

      <!-- Bottom Contact & Signoff -->
      <div style="margin-top: 14px; padding: 12px 16px; background: #0f172a; border-radius: 10px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 9.5pt; font-weight: 800; color: #fbbf24;">Ready to Upgrade Your Restaurant Operations?</div>
          <div style="font-size: 7.5pt; color: #94a3b8; margin-top: 2px;">
            Contact us today to schedule your live system demonstration or activate your license.
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 8.5pt; font-weight: 700; color: #ffffff;">Hotline: 070 7 555 855</div>
          <div style="font-size: 7.5pt; color: #cbd5e1;">Labuduwa, Galle • Sri Lanka</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="page-footer">
      <span>Southern Spoon POS System • Commercial Proposal &amp; Terms</span>
      <span class="page-number">Page 3 of 3</span>
    </div>
  </div>

</body>
</html>
`;

// 2. Write HTML file
const htmlPath = path.join(__dirname, '..', 'Southern_Spoon_POS_System_Proposal.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('HTML proposal written to:', htmlPath);

// 3. Render PDF using Microsoft Edge headless
const pdfPath = path.join(__dirname, '..', 'Southern_Spoon_POS_System_Proposal.pdf');
const edgeExe = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Generating high-resolution PDF with Edge Headless...');
try {
  execFileSync(edgeExe, [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    htmlPath
  ]);

  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`Success! PDF Generated: ${pdfPath}`);
    console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.error('PDF file was not created.');
  }
} catch (err) {
  console.error('Error generating PDF:', err);
}

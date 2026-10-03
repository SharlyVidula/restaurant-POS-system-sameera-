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
  <title>Southern Spoon POS - 2-Page Commercial Sales Proposal & Offer</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap');

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
      color: #0f172a;
      background-color: #ffffff;
      font-size: 8.8pt;
      line-height: 1.4;
    }

    .page {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      position: relative;
      padding: 13mm 16mm 11mm 16mm;
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

    .page-accent-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #059669 100%);
    }

    .page-watermark {
      position: absolute;
      right: -25px;
      bottom: 25px;
      font-size: 110pt;
      font-weight: 900;
      color: rgba(241, 245, 249, 0.55);
      z-index: 0;
      user-select: none;
      pointer-events: none;
      line-height: 1;
    }

    .content-layer {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    /* Header Bar */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 9px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 10px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      object-fit: cover;
      border: 1.5px solid #f59e0b;
      background: #0f172a;
      box-shadow: 0 3px 6px rgba(217, 119, 6, 0.2);
    }

    .brand-text h1 {
      font-size: 13.5pt;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #0f172a;
      line-height: 1.1;
    }

    .brand-text h1 span {
      color: #d97706;
    }

    .brand-text p {
      font-size: 7.2pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 1px;
    }

    .meta-badge-group {
      text-align: right;
    }

    .meta-badge {
      display: inline-block;
      background: #0f172a;
      color: #f8fafc;
      font-size: 6.8pt;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-sub {
      font-size: 7pt;
      color: #64748b;
      margin-top: 2px;
      font-weight: 500;
    }

    /* Hero Banner */
    .hero-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-radius: 10px;
      padding: 10px 14px;
      color: #ffffff;
      margin-bottom: 10px;
      border-left: 4px solid #f59e0b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .hero-title {
      font-size: 11pt;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.2px;
    }

    .hero-title span {
      color: #fbbf24;
    }

    .hero-desc {
      font-size: 7.4pt;
      color: #cbd5e1;
      margin-top: 2px;
      line-height: 1.35;
    }

    .hero-pill {
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      padding: 4px 9px;
      border-radius: 7px;
      font-size: 7.2pt;
      font-weight: 700;
      white-space: nowrap;
      text-align: center;
    }

    /* Section Headings */
    .section-head {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 7px;
    }

    .head-bar {
      width: 4px;
      height: 13px;
      background: #d97706;
      border-radius: 2px;
    }

    .head-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.2px;
      text-transform: uppercase;
    }

    .head-tag {
      font-size: 6.8pt;
      color: #64748b;
      font-weight: 600;
      margin-left: auto;
    }

    /* 4-Pillar Grid */
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
    }

    .card-top {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .card-icon {
      font-size: 11pt;
    }

    .card-title {
      font-size: 8.2pt;
      font-weight: 800;
      color: #0f172a;
    }

    .card-text {
      font-size: 7.2pt;
      color: #475569;
      line-height: 1.35;
    }

    /* Spotlight Box for Newly Added Feature */
    .spotlight-box {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #ecfdf5 100%);
      border: 1.5px solid #f59e0b;
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 10px;
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08);
    }

    .spotlight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .spotlight-tag {
      background: #d97706;
      color: #ffffff;
      font-size: 6.5pt;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .spotlight-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #92400e;
    }

    .spotlight-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 6px;
    }

    .spotlight-item {
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 6px 8px;
    }

    .spotlight-item h4 {
      font-size: 7.6pt;
      font-weight: 800;
      color: #78350f;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
    }

    .spotlight-item p {
      font-size: 6.8pt;
      color: #451a03;
      line-height: 1.3;
    }

    /* Workflow Strip */
    .workflow-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 7px 10px;
      margin-bottom: 8px;
    }

    .workflow-step {
      text-align: center;
      flex: 1;
    }

    .step-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6.8pt;
      font-weight: 800;
      margin: 0 auto 3px auto;
    }

    .step-name {
      font-size: 7.2pt;
      font-weight: 800;
      color: #0f172a;
    }

    .step-desc {
      font-size: 6.3pt;
      color: #64748b;
    }

    .workflow-arrow {
      color: #94a3b8;
      font-size: 9pt;
      font-weight: 800;
      padding: 0 4px;
    }

    /* Page Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 7px;
      border-top: 1px solid #e2e8f0;
      font-size: 6.8pt;
      color: #94a3b8;
      font-weight: 500;
    }

    .page-number {
      font-weight: 700;
      color: #475569;
    }

    /* ========================================================================= */
    /* PAGE 2 STYLES: PRICING & TURNKEY OFFER                                   */
    /* ========================================================================= */
    .pricing-container {
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .price-box {
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    .price-box.standard {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
    }

    .price-box.annual {
      background: #ffffff;
      border: 2px solid #d97706;
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.14);
    }

    .badge-pop {
      position: absolute;
      top: -10px;
      right: 14px;
      background: linear-gradient(90deg, #d97706, #f59e0b);
      color: #ffffff;
      font-size: 6.5pt;
      font-weight: 800;
      padding: 2.5px 8px;
      border-radius: 12px;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .plan-title {
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
    }

    .plan-sub {
      font-size: 7.2pt;
      color: #64748b;
      margin-top: 1px;
    }

    .price-num-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin: 8px 0 4px 0;
    }

    .price-lkr {
      font-size: 9pt;
      font-weight: 700;
      color: #64748b;
    }

    .price-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }

    .price-term {
      font-size: 8pt;
      font-weight: 600;
      color: #64748b;
    }

    .savings-pill {
      display: inline-block;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 6.8pt;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .feat-list {
      list-style: none;
      margin-bottom: 10px;
    }

    .feat-list li {
      font-size: 7.2pt;
      color: #334155;
      margin-bottom: 4.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .feat-list li .check-green {
      color: #10b981;
      font-weight: 800;
      font-size: 8.5pt;
    }

    .btn-plan {
      display: block;
      text-align: center;
      padding: 8px;
      border-radius: 6px;
      font-size: 7.8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .btn-plan.outline {
      background: #f1f5f9;
      border: 1.5px solid #cbd5e1;
      color: #334155;
    }

    .btn-plan.solid {
      background: linear-gradient(90deg, #d97706, #f59e0b);
      border: 1.5px solid #d97706;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(217, 119, 6, 0.25);
    }

    /* Comparison Table */
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.2pt;
      margin-bottom: 10px;
    }

    .specs-table th {
      background: #f1f5f9;
      text-align: left;
      padding: 4.5px 8px;
      color: #334155;
      font-weight: 800;
      border-bottom: 1.5px solid #cbd5e1;
    }

    .specs-table td {
      padding: 4.5px 8px;
      border-bottom: 1px solid #f1f5f9;
      color: #475569;
    }

    .specs-table tr:nth-child(even) td {
      background: #fafafa;
    }

    .specs-table td.b {
      font-weight: 700;
      color: #0f172a;
    }

    .tag-badge {
      display: inline-block;
      padding: 1.5px 5px;
      border-radius: 4px;
      font-size: 6.2pt;
      font-weight: 800;
      text-transform: uppercase;
    }

    .tag-green { background: #dcfce7; color: #15803d; }
    .tag-blue { background: #e0f2fe; color: #0369a1; }
    .tag-amber { background: #fef3c7; color: #b45309; }

    /* 3-Step Handover */
    .steps-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }

    .step-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 7px 9px;
    }

    .step-card h4 {
      font-size: 7.5pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .step-card p {
      font-size: 6.6pt;
      color: #475569;
      line-height: 1.35;
    }

    /* Bottom Contact Bar */
    .contact-banner {
      background: #0f172a;
      border-radius: 9px;
      padding: 9px 14px;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 4px solid #f59e0b;
    }

    .contact-left h3 {
      font-size: 8.8pt;
      font-weight: 800;
      color: #fbbf24;
    }

    .contact-left p {
      font-size: 6.8pt;
      color: #94a3b8;
      margin-top: 1px;
    }

    .contact-right {
      text-align: right;
    }

    .hotline-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11pt;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.5px;
    }

    .location-text {
      font-size: 6.8pt;
      color: #cbd5e1;
      margin-top: 1px;
    }
  </style>
</head>
<body>

  <!-- ===================================================================== -->
  <!-- PAGE 1 OF 2: SYSTEM CAPABILITIES & INVENTORY ENGINE SPOTLIGHT         -->
  <!-- ===================================================================== -->
  <div class="page">
    <div class="page-accent-top"></div>
    <div class="page-watermark">POS</div>

    <div class="content-layer">
      <!-- Top Brand Header -->
      <div class="header-bar">
        <div class="brand-group">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Southern Spoon Logo" class="brand-logo" />` : ''}
          <div class="brand-text">
            <h1>SOUTHERN <span>SPOON</span></h1>
            <p>Labuduwa, Galle • Prepared For: Restaurant Management</p>
          </div>
        </div>
        <div class="meta-badge-group">
          <span class="meta-badge">Commercial Proposal &amp; Sales Offer</span>
          <div class="meta-sub">Developer Direct: 077 336 1565</div>
        </div>
      </div>

      <!-- Hero Value Statement -->
      <div class="hero-box">
        <div>
          <div class="hero-title">High-Speed POS &amp; Live Restaurant Command <span>for Southern Spoon</span></div>
          <div class="hero-desc">
            Engineered for high-volume rush hours: Offline-first touch billing, station-routed KOT kitchen printing, automatic cash drawer kicks, real-time Google Sheets phone sync, and all-new dynamic inventory &amp; portion control.
          </div>
        </div>
        <div class="hero-pill">
          ⚡ 100% Offline-First<br/>No Internet Dependency
        </div>
      </div>

      <!-- 4 Core Operational Pillars -->
      <div>
        <div class="section-head">
          <div class="head-bar"></div>
          <div class="head-title">Core Operating Capabilities</div>
          <div class="head-tag">Engineered for Reliability &amp; Speed</div>
        </div>

        <div class="grid-4">
          <div class="card">
            <div class="card-top">
              <span class="card-icon">⚡</span>
              <span class="card-title">Lightning Touch Billing &amp; Table Orders</span>
            </div>
            <p class="card-text">
              Dine-In, Takeaway, and Delivery workflows. Full interactive table sessions, quick tender cash calculators, split payments, and instant discount authorization.
            </p>
          </div>

          <div class="card">
            <div class="card-top">
              <span class="card-icon">☁️</span>
              <span class="card-title">Real-Time Google Sheets Cloud Sync</span>
            </div>
            <p class="card-text">
              Every settled bill mirrors instantly to your private Google Sheet. View itemized portions, revenue sums, payment splits, and shifts live from your smartphone.
            </p>
          </div>

          <div class="card">
            <div class="card-top">
              <span class="card-icon">🖨️</span>
              <span class="card-title">Direct ESC/POS Thermal Printing &amp; Auto-Kick</span>
            </div>
            <p class="card-text">
              Native support for 80mm &amp; 58mm thermal receipt printers. Automatically triggers the 24V RJ11 cash drawer solenoid and auto-routes KOT slips to kitchen stations.
            </p>
          </div>

          <div class="card">
            <div class="card-top">
              <span class="card-icon">🛡️</span>
              <span class="card-title">Shift Audits &amp; Anti-Theft Governance</span>
            </div>
            <p class="card-text">
              Mandatory morning float entry, mid-shift X-Reports, blind cash drawer closing declarations, automated over/short Z-Reports, and master supervisor PIN protection.
            </p>
          </div>
        </div>
      </div>

      <!-- HIGHLIGHTED FEATURE SPOTLIGHT: ALL-NEW INVENTORY & PORTION CONTROL -->
      <div class="spotlight-box">
        <div class="spotlight-header">
          <div class="spotlight-title">✨ All-New Feature Spotlight: Live Inventory &amp; Portion Size Management</div>
          <span class="spotlight-tag">Newly Added &amp; Fully Integrated</span>
        </div>
        <p style="font-size: 7.2pt; color: #78350f; line-height: 1.35;">
          Directly integrated into the POS admin header, the new <strong>Inventory Center</strong> empowers Southern Spoon managers to control prices, configure portion sizes, and expand the menu in real time without technical support.
        </p>

        <div class="spotlight-grid">
          <div class="spotlight-item">
            <h4>🏷️ Real-Time Price Modifier</h4>
            <p>Update base menu prices with quick steppers (-50, +50, +100) and instant audit logs with user/timestamp tracking.</p>
          </div>

          <div class="spotlight-item">
            <h4>🍲 Portion Sizing Engine</h4>
            <p>Configure Half / Full, Small / Regular / Large, or custom portion variants with individual price adjustments and live totals.</p>
          </div>

          <div class="spotlight-item">
            <h4>📂 Universal Category Addition</h4>
            <p>Add new dishes across all categories (Rice, Kottu, Noodles, Devilled, Juices, Desserts, Cigarettes) with 86 stock-out toggles.</p>
          </div>
        </div>
      </div>

      <!-- Quick 5-Step Operational Flow -->
      <div>
        <div class="section-head">
          <div class="head-bar"></div>
          <div class="head-title">Rush-Hour Operational Flow</div>
          <div class="head-tag">Seamless Order-to-Cash in Seconds</div>
        </div>

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
            <div class="step-desc">Cash notes / Card / QR</div>
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
        <span>Southern Spoon POS System • Commercial Proposal &amp; Technical Specifications</span>
        <span class="page-number">Page 1 of 2</span>
      </div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- PAGE 2 OF 2: ATTRACTIVE COMMERCIAL PRICING, HARDWARE & ACTIVATION    -->
  <!-- ===================================================================== -->
  <div class="page">
    <div class="page-accent-top"></div>
    <div class="page-watermark">OFFER</div>

    <div class="content-layer">
      <!-- Top Brand Header -->
      <div class="header-bar">
        <div class="brand-group">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Southern Spoon Logo" class="brand-logo" />` : ''}
          <div class="brand-text">
            <h1>SOUTHERN <span>SPOON</span></h1>
            <p>Investment Options &amp; Turnkey Onboarding Guarantee</p>
          </div>
        </div>
        <div class="meta-badge-group">
          <span class="meta-badge">Commercial Pricing Offer</span>
          <div class="meta-sub">Developer Direct Line: 077 336 1565</div>
        </div>
      </div>

      <!-- Pricing Plans Side-by-Side -->
      <div>
        <div class="section-head">
          <div class="head-bar"></div>
          <div class="head-title">Commercial Licensing &amp; Investment Plans</div>
          <div class="head-tag">Transparent Pricing • No Hidden Fees</div>
        </div>

        <div class="pricing-container">
          <!-- Monthly Plan -->
          <div class="price-box standard">
            <div>
              <div class="plan-title">Monthly Flexibility</div>
              <div class="plan-sub">Pay month-to-month with total freedom</div>

              <div class="price-num-row">
                <span class="price-lkr">LKR</span>
                <span class="price-val">5,000</span>
                <span class="price-term">/ month</span>
              </div>
              <p style="font-size: 6.8pt; color: #64748b; margin-bottom: 8px;">Cancel or upgrade anytime with zero penalties.</p>

              <ul class="feat-list">
                <li><span class="check-green">✓</span> Complete Offline POS System &amp; Desktop App</li>
                <li><span class="check-green">✓</span> 80mm &amp; 58mm ESC/POS Thermal Printing</li>
                <li><span class="check-green">✓</span> RJ11 Cash Drawer Auto-Kick Integration</li>
                <li><span class="check-green">✓</span> Kitchen KOT Station Routing (Wok/Bar/Griddle)</li>
                <li><span class="check-green">✓</span> Live Google Sheets Cloud Mirroring</li>
                <li><span class="check-green">✓</span> Shift Management, X-Reports &amp; Z-Reports</li>
                <li><span class="check-green">✓</span> All-New Live Inventory &amp; Portion Controller</li>
                <li><span class="check-green">✓</span> Standard Technical Support (9 AM – 6 PM)</li>
              </ul>
            </div>
            <div>
              <div class="btn-plan outline">Select Monthly • LKR 5,000/mo</div>
            </div>
          </div>

          <!-- Annual Enterprise Plan (RECOMMENDED) -->
          <div class="price-box annual">
            <div class="badge-pop">MOST POPULAR • SAVE 33%</div>
            <div>
              <div class="plan-title">Annual Enterprise Plan</div>
              <div class="plan-sub">Maximum value, complete VIP support &amp; free upgrades</div>

              <div class="price-num-row">
                <span class="price-lkr">LKR</span>
                <span class="price-val" style="color: #d97706;">40,000</span>
                <span class="price-term">/ year</span>
              </div>

              <div class="savings-badge">
                🎉 Instant Savings of LKR 20,000 / Year (Only ~3,333 LKR / month!)
              </div>

              <ul class="feat-list">
                <li><span class="check-green">✓</span> <strong>Everything included in the Monthly Plan</strong></li>
                <li><span class="check-green">✓</span> <strong>1 Full Year of Unlimited Licensing &amp; Usage</strong></li>
                <li><span class="check-green">✓</span> <strong>FREE Initial Menu Setup, Portion Pricing &amp; Category Pre-Load</strong></li>
                <li><span class="check-green">✓</span> <strong>Priority 24/7 Phone &amp; Remote WhatsApp Support</strong></li>
                <li><span class="check-green">✓</span> <strong>On-Site or Remote Staff Cashier &amp; Supervisor Training</strong></li>
                <li><span class="check-green">✓</span> <strong>FREE Software Feature Updates, Patches &amp; Cloud Sync Tuning</strong></li>
                <li><span class="check-green">✓</span> <strong>Guaranteed 2-Year Renewal Price Lock Protection</strong></li>
              </ul>
            </div>
            <div>
              <div class="btn-plan solid">Choose Annual Plan (Recommended)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Turnkey Hardware Compatibility Matrix -->
      <div>
        <div class="section-head">
          <div class="head-bar"></div>
          <div class="head-title">Hardware Compatibility Specifications</div>
          <div class="head-tag">Plug &amp; Play with Standard Hardware</div>
        </div>

        <table class="specs-table">
          <thead>
            <tr>
              <th style="width: 25%;">Hardware Component</th>
              <th style="width: 55%;">Supported Standard &amp; Models</th>
              <th style="width: 20%;">Compatibility Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="b">POS Terminal / PC</td>
              <td>Any Windows 10/11 Desktop, Touch AIO, Mini PC, or Laptop. Native Electron app.</td>
              <td><span class="tag-badge tag-green">Fully Compatible</span></td>
            </tr>
            <tr>
              <td class="b">Thermal Printers</td>
              <td>Standard 80mm &amp; 58mm USB / Serial ESC/POS. Epson, Xprinter, Rongta, Bixolon, Sunmi.</td>
              <td><span class="tag-badge tag-green">Native Support</span></td>
            </tr>
            <tr>
              <td class="b">Cash Drawers</td>
              <td>Standard 12V / 24V RJ11 interface connected to thermal receipt printer.</td>
              <td><span class="tag-badge tag-green">Auto-Kick</span></td>
            </tr>
            <tr>
              <td class="b">Internet &amp; Network</td>
              <td>Operates 100% offline. Internet (Wi-Fi/Dongle) only needed for Google Sheets cloud sync.</td>
              <td><span class="tag-badge tag-blue">Offline-First</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Fast 3-Step Handover -->
      <div>
        <div class="section-head">
          <div class="head-bar"></div>
          <div class="head-title">Fast 3-Step Zero-Downtime Deployment</div>
          <div class="head-tag">Turnkey Handover Within 24 Hours</div>
        </div>

        <div class="steps-row">
          <div class="step-card">
            <h4>Step 1: Setup &amp; Menu Load</h4>
            <p>We install the desktop POS, configure categories, food items, base prices, portion sizing, and link Google Sheets.</p>
          </div>

          <div class="step-card">
            <h4>Step 2: Hardware Pairing</h4>
            <p>We calibrate thermal receipt printers, test kitchen KOT dispatch, test RJ11 drawer kick, and customize receipt footers.</p>
          </div>

          <div class="step-card">
            <h4>Step 3: Staff Training</h4>
            <p>A quick 30-minute interactive cashier training on speed billing, shift floats, discount PINs, and day-end Z-Reports.</p>
          </div>
        </div>
      </div>

      <!-- Bottom Contact Call to Action Bar -->
      <div class="contact-banner">
        <div class="contact-left">
          <h3>Ready to Modernize Southern Spoon Labuduwa?</h3>
          <p>Contact software developer directly to schedule live demonstration or activate your license.</p>
        </div>
        <div class="contact-right">
          <div class="hotline-num">Direct: 077 336 1565</div>
          <div class="location-text">Software Developer &amp; Technical Lead</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="page-footer">
        <span>Southern Spoon POS System • Developer Direct: 077 336 1565</span>
        <span class="page-number">Page 2 of 2</span>
      </div>
    </div>
  </div>

</body>
</html>
`;

// Write HTML
const htmlPath = path.join(__dirname, '..', 'Southern_Spoon_POS_System_Proposal.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('2-Page HTML Proposal written to:', htmlPath);

// Render PDF with Edge Headless
const pdfPath = path.join(__dirname, '..', 'Southern_Spoon_POS_System_Proposal.pdf');
const edgeExe = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Rendering 2-Page PDF with Microsoft Edge headless...');
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
    console.log(`Success! 2-Page PDF Generated: ${pdfPath}`);
    console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.error('PDF file was not created.');
  }
} catch (err) {
  console.error('Error generating PDF:', err);
}

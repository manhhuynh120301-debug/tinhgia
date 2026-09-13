# 3D Price Calculator - 3D Printing Cost & TikTok Shop Price Calculator

A modern, production-ready web application for 3D printing businesses and maker workshops to calculate itemized manufacturing costs, direct customer quote prices, and recommended listing prices on **TikTok Shop** using a mathematical reverse-pricing solver.

Supports dedicated presets for **SparkX i7 Combo** and **A2L Combo** 3D printers.

---

## 🌟 Key Features

1. **Itemized Manufacturing Cost (COGS) Breakdown**:
   - **Material Cost**: `Weight (g) × Filament Price (VND/g)`
   - **Electricity Cost**: `(Weight / 1000) × Electricity Rate (VND/kg)`
   - **Machine Depreciation & Wear**: `Printing Hours × Printer Hourly Cost (VND/h)` (SparkX i7 Combo & A2L Combo)
   - **Support/Waste Percentage**: Optional material waste reserve
   - **Packaging & Other Costs**: Boxes, bubble wrap, adhesives, hardware, magnets, and post-processing
   - **Risk/Failure Reserve**: Percentage buffer for failed prints or nozzle clogs

2. **Customer Quote Pricing Strategies**:
   - **Option 1 (Multiplier)**: `Cost × Multiplier` (Quick buttons: `x1.5`, `x2.0`, `x2.5`, `x3.0`, `x3.5`, or custom)
   - **Option 2 (Target Profit)**: `Cost + Fixed Desired Profit (VND)`
   - **Option 3 (Custom Price)**: Directly specify quote price

3. **TikTok Shop Reverse Price Solver**:
   - Automatically computes the minimum optimal listing price $P$ such that:
     $$\text{Estimated Net Received Amount} \ge \text{Customer Quote Price} - \text{Allowed Difference}$$
   - Solves for all percentage fees (Transaction 6%, Commission 4%, Voucher Extra, Taxes) and fixed deductions (Order processing, seller shipping).
   - Supports rounding modes (1,000 VND, 500 VND, custom step) with a safe step-up constraint to prevent netting less than the target amount.
   - Comprehensive **Settlement Statement** breakdown table.

4. **LocalStorage Persistence & History Management**:
   - Save, reload, duplicate, delete, and search calculation history.
   - Filter by printer model (**SparkX i7 Combo**, **A2L Combo**).
   - Export backup to JSON and print/copy professional Vietnamese quotation slips.

---

## 📐 Mathematical Formulation & TikTok Shop Fee Logic

### 1. Total Production Cost Formulation
$$\text{Material Cost} = W \times P_{\text{filament}}$$
$$\text{Electricity Cost} = \left(\frac{W}{1000}\right) \times P_{\text{electricity}}$$
$$\text{Machine Cost} = T \times R_{\text{machine}}$$
$$\text{Waste Cost} = \text{Material Cost} \times \left(\frac{\%_{\text{waste}}}{100}\right)$$
$$\text{Subtotal} = \text{Material} + \text{Electricity} + \text{Machine} + \text{Packaging} + \text{Other} + \text{Waste}$$
$$\text{Total Production Cost} = \text{Subtotal} \times \left(1 + \frac{\%_{\text{risk}}}{100}\right)$$

### 2. TikTok Shop Reverse Price Solver
Given target quote price $Q$, allowed difference $\Delta$, total fee percentage $r = \sum r_i$, and total fixed fees $F = \sum F_j$:
$$\text{Target Minimum Net} = Q - \Delta$$
$$\text{Listing Price (Raw)} = \frac{\text{Target Minimum Net} + F}{1 - r}$$
After applying the rounding increment step $S$, the algorithm verifies:
$$\text{Net}(P) = P \times (1 - r) - F \ge \text{Target Minimum Net}$$
If standard rounding down drops the payout below the target, the algorithm steps up to $\lceil P_{\text{raw}} / S \rceil \times S$.

---

## 🚀 Installation & Local Development

### Requirements
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm** or **yarn**

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/your-username/3d-price-calculator.git
cd 3d-price-calculator

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

The compiled static assets will be output to the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment Guidelines

### Deploy to GitHub
```bash
git init
git add .
git commit -m "Initial commit: 3D Price Calculator with TikTok Shop solver"
git branch -M main
git remote add origin https://github.com/your-username/3d-price-calculator.git
git push -u origin main
```

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Import your GitHub repository.
3. Framework Preset: **Vite** (or Other).
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Click **Deploy**.

---

## ⚙️ Environment Variables

This application is built as an offline-first client-side web application with `localStorage` persistence. No external database or API keys are required for core calculations.

If integrating future server-side extensions:
```env
# .env.example
GEMINI_API_KEY=""
APP_URL=""
```

---

## ⚠️ Disclaimer regarding TikTok Shop Settlements

The TikTok Shop calculation is an estimation based on standard seller fees, commissions, and program configurations entered by the user. Actual settlement payouts in your TikTok Seller Center wallet may differ due to:
- Specific category commission tier adjustments
- Real-time seller voucher campaigns and co-funded promotions
- Platform shipping subsidies and customer weight discrepancies
- Value-Added Tax (VAT) and Personal Income Tax (PIT) withholding policies
- Regional order processing updates

Always cross-check your monthly settlement statements in the TikTok Shop Seller Center.

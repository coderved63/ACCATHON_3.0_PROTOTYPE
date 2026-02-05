# Financial Modelling Guide

## 🧮 Valuation Methodology
The platform uses a **Discounted Cash Flow (DCF)** model specifically adapted for **Non-Banking Financial Companies (NBFCs)**.

### 1. Cash Flow Proxy
For Bajaj Finance, we use **Profit After Tax (PAT)** as a conservative proxy for Free Cash Flow, as traditional FCFF models (adjusted for debt) are less applicable to financial firms where interest is an operating expense.

### 2. Forecasting
- **Growth Rate**: Derived from historical Revenue CAGR (Approx ~18%).
- **Margins**: Based on historical average Profit after Tax margins.

### 3. The Formula
- **PV_forecast** = Sum of PAT / (1 + WACC)^n
- **Terminal Value** = [PAT(5) * (1 + g)] / (WACC - g)
- **Equity Value** = PV_forecast + PV_terminal
- **Intrinsic Value** = Equity Value / Shares Outstanding (60.5 Cr)

## 🎯 Signals
- **BUY**: Intrinsic Value > Market Price + 10% Margin of Safety.
- **SELL**: Intrinsic Value < Market Price - 10% Margin of Safety.
- **HOLD**: Within +/- 10% range.

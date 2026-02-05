# DB Schema Documentation

## Tables

### 1. `users`
- `id`: PK
- `email`: UNIQUE, NOT NULL
- `password_hash`: NOT NULL

### 2. `financial_statements`
- `fiscal_year`: INTEGER (e.g., 2023)
- `statement_type`: ENUM (INCOME_STATEMENT, BALANCE_SHEET, CASH_FLOW)
- `metrics`: JSONB (Key-Value pairs of financial line items)
- `is_forecast`: BOOLEAN

### 3. `valuation_results`
- `intrinsic_value_per_share`: DECIMAL
- `current_market_price`: DECIMAL
- `recommendation`: VARCHAR (BUY/HOLD/SELL)
- `explanation_summary`: TEXT
- `dcf_details`: JSONB (Breakdown of forecast and PVs)

### 4. `valuation_assumptions`
- `wacc`: DECIMAL (Default 11%)
- `terminal_growth_rate`: DECIMAL (Default 5%)

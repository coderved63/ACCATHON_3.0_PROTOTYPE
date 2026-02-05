const db = require('../db');

/**
 * Valuation Service
 * Handles historical analysis, forecasting, and DCF calculation for Bajaj Finance Ltd.
 */
class ValuationService {

    /**
     * Fetch historical financials from DB and normalize
     */
    static async getHistoricalData() {
        const query = `
            SELECT fiscal_year, statement_type, metrics 
            FROM financial_statements 
            WHERE company_name = 'Bajaj Finance Ltd' 
            AND is_forecast = FALSE
            ORDER BY fiscal_year ASC
        `;
        const { rows } = await db.query(query);

        const data = {};
        rows.forEach(row => {
            if (!data[row.fiscal_year]) data[row.fiscal_year] = {};
            data[row.fiscal_year][row.statement_type] = row.metrics;
        });

        return data;
    }

    /**
     * Perform DCF Valuation
     */
    static async performValuation() {
        const history = await this.getHistoricalData();
        const years = Object.keys(history).sort();

        if (years.length < 3) {
            throw new Error('Insufficient historical data for valuation');
        }

        // 1. Extract Revenue and PAT (Profit After Tax)
        const revenueSeries = years.map(yr => {
            const is = history[yr]['INCOME_STATEMENT'] || {};
            // Updated to match DB keys: 'Total income' or 'Total Revenue'
            return is['Total income'] || is['Total Revenue'] || is['Revenue from operations'] || 0;
        }).filter(v => v > 0);

        const patSeries = years.map(yr => {
            const is = history[yr]['INCOME_STATEMENT'] || {};
            // Updated to match DB keys: 'Profit after tax'
            return is['Profit after tax'] || is['Profit for the year'] || is['Net Profit'] || 0;
        }).filter(v => v > 0);

        if (revenueSeries.length === 0 || patSeries.length === 0) {
            throw new Error('Financial metrics (Revenue/PAT) not found in expected format');
        }

        // 2. Historical CAGR (Revenue)
        const startRev = revenueSeries[0];
        const endRev = revenueSeries[revenueSeries.length - 1];
        const n = years.length - 1;
        const revCAGR = Math.pow(endRev / startRev, 1 / n) - 1;

        // 3. Assumptions (Default for Bajaj Finance)
        const assumptions = {
            revGrowth: 0.18, // 18% forecast growth (conservative for Bajaj)
            avgPATMargin: patSeries.reduce((a, b) => a + b, 0) / revenueSeries.reduce((a, b) => a + b, 0),
            wacc: 0.11,     // 11% Discount rate
            terminalGrowth: 0.05 // 5% perpetual growth
        };

        // 4. Forecast 5 Years (Net Income as proxy for FCF in NBFC context)
        const forecast = [];
        let lastRev = endRev;
        for (let i = 1; i <= 5; i++) {
            const fRev = lastRev * (1 + assumptions.revGrowth);
            const fPAT = fRev * assumptions.avgPATMargin;
            forecast.push({
                year: parseInt(years[years.length - 1]) + i,
                revenue: fRev,
                pat: fPAT,
                pv: fPAT / Math.pow(1 + assumptions.wacc, i)
            });
            lastRev = fRev;
        }

        // 5. Terminal Value
        const lastFPAT = forecast[4].pat;
        const terminalValue = (lastFPAT * (1 + assumptions.terminalGrowth)) / (assumptions.wacc - assumptions.terminalGrowth);
        const pvTerminalValue = terminalValue / Math.pow(1 + assumptions.wacc, 5);

        // 6. Intrinsic Value
        const pvForecast = forecast.reduce((sum, f) => sum + f.pv, 0);
        const equityValue = pvForecast + pvTerminalValue;

        // Approx shares outstanding for Bajaj Finance (~60-61 Cr)
        const sharesOutstanding = 60.5;
        const intrinsicValuePerShare = (equityValue / sharesOutstanding);

        const currentPrice = 7200; // Reference price for Bajaj Finance (Approx)
        let recommendation = 'HOLD';
        if (intrinsicValuePerShare > currentPrice * 1.1) recommendation = 'BUY';
        if (intrinsicValuePerShare < currentPrice * 0.9) recommendation = 'SELL';

        return {
            company: 'Bajaj Finance Ltd',
            historicalCAGR: revCAGR,
            assumptions,
            forecast,
            equityValue,
            intrinsicValuePerShare,
            currentPrice,
            recommendation,
            explanation: `Based on a 5-year DCF model with a ${Math.round(assumptions.revGrowth * 100)}% revenue growth assumption and ${Math.round(assumptions.wacc * 100)}% WACC. Intrinsic value is estimated at ₹${intrinsicValuePerShare.toFixed(2)}.`
        };
    }

    /**
     * Save valuation result to DB
     */
    static async saveValuation(result) {
        // Save assumptions
        const assRes = await db.query(
            `INSERT INTO valuation_assumptions (description, wacc, terminal_growth_rate, revenue_growth_forecast)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            ['Standard DCF Assumptions', result.assumptions.wacc, result.assumptions.terminalGrowth, JSON.stringify(result.forecast.map(f => result.assumptions.revGrowth))]
        );

        // Save results
        await db.query(
            `INSERT INTO valuation_results (intrinsic_value_per_share, current_market_price, recommendation, explanation_summary, dcf_details)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                result.intrinsicValuePerShare,
                result.currentPrice,
                result.recommendation,
                result.explanation,
                JSON.stringify({
                    forecast: result.forecast,
                    equityValue: result.equityValue,
                    historicalCAGR: result.historicalCAGR
                })
            ]
        );
    }
}

module.exports = ValuationService;

import pkg from 'pg';  
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pkg;  

const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'excel',
  password: 'pass',
  port: 5433,
});

await client.connect();

// Utility function to handle missing or invalid values
function parseValue(value) {
  return (!value || value === '-' || value.trim() === '') 
    ? 0 
    : parseFloat(value.replace(/,/g, '')) || 0; // Remove commas before parsing
}

async function processRatiosData() {
  try {
    // Read the org_id from org.json
    const orgJsonFilePath = path.join(__dirname, 'saved', 'org.json');
    const orgData = JSON.parse(fs.readFileSync(orgJsonFilePath, 'utf8'));
    const org_id = orgData.org_id;
  
    // Read the ratios data
    const jsonFilePath = path.join(__dirname, 'outputjson', 'restructured_data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    const ratiosData = [];
  
    jsonData.data.forEach(entry => {
      if (entry.data["ratios"]) {
        ratiosData.push({ date_range: entry.date_range, type: "standalone", records: entry.data["ratios"] });
      }
      if (entry.data["consolidated_ratios"]) {
        ratiosData.push({ date_range: entry.date_range, type: "consolidated", records: entry.data["consolidated_ratios"] });
      }
    });
  
    const formattedData = ratiosData.map(sheet => ({
      org_id: org_id,
      data_range: sheet.date_range,
      type: sheet.type,
      revenue_growth: parseValue(sheet.records.find(r => r["Revenue Growth (%)"])?.["Revenue Growth (%)"]),
      ebitda_margins: parseValue(sheet.records.find(r => r["EBITDA Margins (%)"])?.["EBITDA Margins (%)"]),
      ebt_margins: parseValue(sheet.records.find(r => r["EBT Margins (%)"])?.["EBT Margins (%)"]),
      pat_margins: parseValue(sheet.records.find(r => r["PAT Margins (%)"])?.["PAT Margins (%)"]),
      return_on_equity: parseValue(sheet.records.find(r => r["Return on Equity (%)"])?.["Return on Equity (%)"]),
      return_on_fixed_assets: parseValue(sheet.records.find(r => r["Return on Fixed Assets (%)"])?.["Return on Fixed Assets (%)"]),
      return_on_capital_employed: parseValue(sheet.records.find(r => r["Return on Capital Employed (%)"])?.["Return on Capital Employed (%)"]),
      current_ratio: parseValue(sheet.records.find(r => r["Current Ratio"])?.["Current Ratio"]),
      quick_ratio: parseValue(sheet.records.find(r => r["Quick Ratio"])?.["Quick Ratio"]),
      interest_coverage_ratio: parseValue(sheet.records.find(r => r["Interest Coverage Ratio"])?.["Interest Coverage Ratio"]),
      long_term_debt_equity: parseValue(sheet.records.find(r => r["Long-term Debt/Equity"])?.["Long-term Debt/Equity"]),
      total_assets_equity: parseValue(sheet.records.find(r => r["Total Assets/Equity"])?.["Total Assets/Equity"]),
      total_debt_equity: parseValue(sheet.records.find(r => r["Total Debt/Equity"])?.["Total Debt/Equity"]),
      total_debt_total_assets: parseValue(sheet.records.find(r => r["Total Debt/Total Assets"])?.["Total Debt/Total Assets"]),
      total_debt_ebitda: parseValue(sheet.records.find(r => r["Total Debt/EBITDA"])?.["Total Debt/EBITDA"]),
      fixed_assets_turnover: parseValue(sheet.records.find(r => r["Fixed Assets Turnover"])?.["Fixed Assets Turnover"]),
      total_asset_turnover: parseValue(sheet.records.find(r => r["Total Asset Turnover"])?.["Total Asset Turnover"]),
      working_capital_turnover: parseValue(sheet.records.find(r => r["Working Capital Turnover"])?.["Working Capital Turnover"]),
      inventory_days: parseValue(sheet.records.find(r => r["Inventory Days"])?.["Inventory Days"]),
      receivables_days: parseValue(sheet.records.find(r => r["Receivables Days*"])?.["Receivables Days*"]),
      payable_days: parseValue(sheet.records.find(r => r["Payable Days*"])?.["Payable Days*"]),
      cash_conversion_cycle: parseValue(sheet.records.find(r => r["Cash Conversion Cycle*"])?.["Cash Conversion Cycle*"]),
      raw_material_consumption: parseValue(sheet.records.find(r => r["Raw Material Consumption (% of Sales)"])?.["Raw Material Consumption (% of Sales)"]),
      total_employee_cost: parseValue(sheet.records.find(r => r["Total Employee Cost (% of Sales)"])?.["Total Employee Cost (% of Sales)"]),
      finance_cost: parseValue(sheet.records.find(r => r["Finance Cost (% of Sales)"])?.["Finance Cost (% of Sales)"]),
      total_other_expenses: parseValue(sheet.records.find(r => r["Total Other Expenses (% of Sales)"])?.["Total Other Expenses (% of Sales)"])
    }));
    
  
    
    // Insert the data into the ratios table
    for (const record of formattedData) {
      try {
        const insertQuery = `
          INSERT INTO ratios (
            org_id, data_range, type, revenue_growth, ebitda_margins, ebt_margins, pat_margins, return_on_equity, return_on_fixed_assets, 
            return_on_capital_employed, current_ratio, quick_ratio, interest_coverage_ratio, long_term_debt_equity, total_assets_equity, 
            total_debt_equity, total_debt_total_assets, total_debt_ebitda, fixed_assets_turnover, total_asset_turnover, working_capital_turnover, 
            inventory_days, receivables_days, payable_days, cash_conversion_cycle, raw_material_consumption, total_employee_cost, finance_cost, 
            total_other_expenses
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 
            $26, $27, $28, $29
          )
        `;
        
        const values = [
          record.org_id, record.data_range, record.type, record.revenue_growth, record.ebitda_margins, record.ebt_margins, 
          record.pat_margins, record.return_on_equity, record.return_on_fixed_assets, record.return_on_capital_employed, 
          record.current_ratio, record.quick_ratio, record.interest_coverage_ratio, record.long_term_debt_equity, record.total_assets_equity, 
          record.total_debt_equity, record.total_debt_total_assets, record.total_debt_ebitda, record.fixed_assets_turnover, 
          record.total_asset_turnover, record.working_capital_turnover, record.inventory_days, record.receivables_days, 
          record.payable_days, record.cash_conversion_cycle, record.raw_material_consumption, record.total_employee_cost, 
          record.finance_cost, record.total_other_expenses
        ];
  
        await client.query(insertQuery, values);
        console.log(`Inserted record for data_range: ${record.data_range}, type: ${record.type}`);
      } catch (err) {
        console.error(`Error inserting record for data_range: ${record.data_range}, type: ${record.type}`, err);
      }
    }
  
    console.log('Data successfully inserted into ratios table.');
  } catch (error) {
    console.error("Error processing ratios data:", error);
  } finally {
    await client.end();
  }
}

processRatiosData();

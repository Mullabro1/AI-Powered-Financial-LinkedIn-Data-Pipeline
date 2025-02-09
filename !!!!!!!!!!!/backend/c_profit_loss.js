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


async function processProfitLossData() {
  try {
    // Read the org_id from org.json
    const orgJsonFilePath = path.join(__dirname, 'saved', 'org.json');
    const orgData = JSON.parse(fs.readFileSync(orgJsonFilePath, 'utf8'));
    const org_id = orgData.org_id;
  
    // Read the profit and loss data
    const jsonFilePath = path.join(__dirname, 'outputjson', 'restructured_data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    const profitLosses = [];
  
    jsonData.data.forEach(entry => {
      if (entry.data["profit_&_loss"]) {
        profitLosses.push({ date_range: entry.date_range, type: "standalone", records: entry.data["profit_&_loss"] });
      } 
      if (entry.data["consolidated_profit_&_loss"]) {
        profitLosses.push({ date_range: entry.date_range, type: "consolidated", records: entry.data["consolidated_profit_&_loss"] });
      }
    });
  
    const formattedData = profitLosses.map(sheet => ({
      org_id: org_id,
      data_range: sheet.date_range,
      type: sheet.type,
      revenue_from_sale_of_products: parseValue(sheet.records.find(r => r["Revenue from Sale of Products"])?.["Revenue from Sale of Products"]),
      revenue_from_sale_of_services: parseValue(sheet.records.find(r => r["Revenue from Sale of Services"])?.["Revenue from Sale of Services"]),
      total_revenue_from_operations: parseValue(sheet.records.find(r => r["Total Revenue from Operations"])?.["Total Revenue from Operations"]),
      total_revenue: parseValue(sheet.records.find(r => r["Total Revenue"])?.["Total Revenue"]),
      cost_of_materials_consumed: parseValue(sheet.records.find(r => r["Cost of Materials Consumed"])?.["Cost of Materials Consumed"]),
      changes_in_inventories: parseValue(sheet.records.find(r => r["Changes in Inventories"])?.["Changes in Inventories"]),
      total_employee_benefit_expense: parseValue(sheet.records.find(r => r["Total Employee Benefit Expense"])?.["Total Employee Benefit Expense"]),
      total_other_expenses: parseValue(sheet.records.find(r => r["Total Other Expenses"])?.["Total Other Expenses"]),
      EBITDA: parseValue(sheet.records.find(r => r["EBITDA"])?.["EBITDA"]),
      EBITDA_percent: parseValue(sheet.records.find(r => r["EBITDA %"])?.["EBITDA %"]),
      total_depreciation_depletion_amortization: parseValue(sheet.records.find(r => r["Total Depreciation, Depletion, Amortization"])?.["Total Depreciation, Depletion, Amortization"]),
      total_expenses: parseValue(sheet.records.find(r => r["Total Expenses"])?.["Total Expenses"]),
      profit_before_exceptional_and_extraordinary_items_and_tax: parseValue(sheet.records.find(r => r["Profit before Exceptional and Extraordinary Items and Tax"])?.["Profit before Exceptional and Extraordinary Items and Tax"]),
      exceptional_items: parseValue(sheet.records.find(r => r["Exceptional Items"])?.["Exceptional Items"]),
      profit_before_extraordinary_items_and_tax: parseValue(sheet.records.find(r => r["Profit before Extraordinary Items and Tax"])?.["Profit before Extraordinary Items and Tax"]),
      profit_before_tax: parseValue(sheet.records.find(r => r["Profit before Tax"])?.["Profit before Tax"]),
      tax_expense: parseValue(sheet.records.find(r => r["Tax Expense"])?.["Tax Expense"]),
      current_tax: parseValue(sheet.records.find(r => r["Current Tax"])?.["Current Tax"]),
      deferred_tax: parseValue(sheet.records.find(r => r["Deferred Tax"])?.["Deferred Tax"]),
      profit_loss_from_continuing_operations: parseValue(sheet.records.find(r => r["Profit/(Loss) for the Period from Continuing Operations"])?.["Profit/(Loss) for the Period from Continuing Operations"]),
      profit_loss_from_discontinuing_operations: parseValue(sheet.records.find(r => r["Profit/(Loss) from Discontinuing Operations"])?.["Profit/(Loss) from Discontinuing Operations"]),
      profit_loss: parseValue(sheet.records.find(r => r["Profit/(Loss)"])?.["Profit/(Loss)"]),
    }));
  
   
    
    // Insert the data into the profit_loss table
    for (const record of formattedData) {
      try {
        const insertQuery = `
          INSERT INTO profit_loss (
            org_id, data_range, type, revenue_from_sale_of_products, revenue_from_sale_of_services, total_revenue_from_operations, total_revenue,
            cost_of_materials_consumed, changes_in_inventories, total_employee_benefit_expense, total_other_expenses, EBITDA, EBITDA_percent,
            total_depreciation_depletion_amortization, total_expenses, profit_before_exceptional_and_extraordinary_items_and_tax, exceptional_items,
            profit_before_extraordinary_items_and_tax, profit_before_tax, tax_expense, current_tax, deferred_tax, profit_loss_from_continuing_operations,
            profit_loss_from_discontinuing_operations, profit_loss
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
          )
        `;
        const values = [
          record.org_id, record.data_range, record.type,
          record.revenue_from_sale_of_products, record.revenue_from_sale_of_services, record.total_revenue_from_operations, record.total_revenue,
          record.cost_of_materials_consumed, record.changes_in_inventories, record.total_employee_benefit_expense, record.total_other_expenses, record.EBITDA, 
          record.EBITDA_percent, record.total_depreciation_depletion_amortization, record.total_expenses, record.profit_before_exceptional_and_extraordinary_items_and_tax, 
          record.exceptional_items, record.profit_before_extraordinary_items_and_tax, record.profit_before_tax, record.tax_expense, record.current_tax, record.deferred_tax,
          record.profit_loss_from_continuing_operations, record.profit_loss_from_discontinuing_operations, record.profit_loss
        ];
  
        await client.query(insertQuery, values);
        console.log(`Inserted record for data_range: ${record.data_range}, type: ${record.type}`);
      } catch (err) {
        console.error(`Error inserting record for data_range: ${record.data_range}, type: ${record.type}`, err);
      }
    }
  
    console.log('Data successfully inserted into profit_loss table.');
  } catch (error) {
    console.error("Error processing profit loss data:", error);
  } finally {
    await client.end();
  }
}

processProfitLossData();

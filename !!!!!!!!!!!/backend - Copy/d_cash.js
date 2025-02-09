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


async function processCashStatementData() {
  try {
    // Read the org_id from org.json
    const orgJsonFilePath = path.join(__dirname, 'saved', 'org.json');
    const orgData = JSON.parse(fs.readFileSync(orgJsonFilePath, 'utf8'));
    const org_id = orgData.org_id;
  
    // Read the cash statement data
    const jsonFilePath = path.join(__dirname, 'outputjson', 'restructured_data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    const cashStatements = [];
  
    jsonData.data.forEach(entry => {
      if (entry.data["cash_flow_statement"]) {
        cashStatements.push({ date_range: entry.date_range, type: "standalone", records: entry.data["cash_flow_statement"] });
      } 
      if (entry.data["consolidated_cash_flow_statement"]) {
        cashStatements.push({ date_range: entry.date_range, type: "consolidated", records: entry.data["consolidated_cash_flow_statement"] });
      }
    });
    const formattedData = cashStatements.map(sheet => ({
      org_id: org_id,
      data_range: sheet.date_range,
      type: sheet.type,
      profit_before_tax: parseValue(sheet.records.find(r => r["Profit before tax"])?.["Profit before tax"]),
      adjustments_for_depreciation_amortisation: parseValue(sheet.records.find(r => r["Adjustments for depreciation and amortisation expense"])?.["Adjustments for depreciation and amortisation expense"]),
      adjustments_for_impairment_loss_reversal: parseValue(sheet.records.find(r => r["Adjustments for impairment loss reversal of impairment loss recognised in profit or loss"])?.["Adjustments for impairment loss reversal of impairment loss recognised in profit or loss"]),
      net_cash_flows_from_operations: parseValue(sheet.records.find(r => r["Net cash flows from (used in) operations"])?.["Net cash flows from (used in) operations"]),
      dividends_received: parseValue(sheet.records.find(r => r["Dividends received"])?.["Dividends received"]),
      interest_paid: parseValue(sheet.records.find(r => r["Interest paid"])?.["Interest paid"]),
      interest_received: parseValue(sheet.records.find(r => r["Adjustments for interest income"])?.["Adjustments for interest income"]),
      income_taxes_paid: parseValue(sheet.records.find(r => r["Income taxes paid (refund)"])?.["Income taxes paid (refund)"]),
      other_inflows_outflows_of_cash: parseValue(sheet.records.find(r => r["Other inflows (outflows) of cash"])?.["Other inflows (outflows) of cash"]),
      net_cash_flows_from_operating_activities: parseValue(sheet.records.find(r => r["Net cash flows from (used in) operating activities"])?.["Net cash flows from (used in) operating activities"]),
      proceeds_from_sales_of_property: parseValue(sheet.records.find(r => r["Proceeds from sales of property, plant and equipment"])?.["Proceeds from sales of property, plant and equipment"]),
      purchase_of_property: parseValue(sheet.records.find(r => r["Purchase of property, plant and equipment"])?.["Purchase of property, plant and equipment"]),
      proceeds_from_sales_of_intangible_assets: parseValue(sheet.records.find(r => r["Proceeds from sales of intangible assets"])?.["Proceeds from sales of intangible assets"]),
      purchase_of_intangible_assets: parseValue(sheet.records.find(r => r["Purchase of Intangible Assets"])?.["Purchase of Intangible Assets"]),
      cash_receipts_from_repayment: parseValue(sheet.records.find(r => r["Cash receipts from repayment of advances and loans made to other parties"])?.["Cash receipts from repayment of advances and loans made to other parties"]),
      dividends_received_in_investing: parseValue(sheet.records.find(r => r["Dividends Received"])?.["Dividends Received"]),
      interest_received_in_investing: parseValue(sheet.records.find(r => r["Interest Received"])?.["Interest Received"]),
      net_cash_flows_from_investing_activities: parseValue(sheet.records.find(r => r["Net cash flows from (used in) investing activities"])?.["Net cash flows from (used in) investing activities"]),
      proceeds_from_issuing_shares: parseValue(sheet.records.find(r => r["Proceeds from issuing shares"])?.["Proceeds from issuing shares"]),
      proceeds_from_issuing_debentures: parseValue(sheet.records.find(r => r["Proceeds from issuing debentures notes bonds etc"])?.["Proceeds from issuing debentures notes bonds etc"]),
      proceeds_from_borrowings: parseValue(sheet.records.find(r => r["Proceeds from borrowings"])?.["Proceeds from borrowings"]),
      repayments_of_borrowings: parseValue(sheet.records.find(r => r["Repayments of borrowings"])?.["Repayments of borrowings"]),
      dividends_paid: parseValue(sheet.records.find(r => r["Dividends paid"])?.["Dividends paid"]),
      interest_paid_in_financing: parseValue(sheet.records.find(r => r["Interest Paid"])?.["Interest Paid"]),
      net_cash_flows_from_financing_activities: parseValue(sheet.records.find(r => r["Net cash flows from (used in) financing activities"])?.["Net cash flows from (used in) financing activities"]),
      net_increase_decrease_in_cash: parseValue(sheet.records.find(r => r["Net increase (decrease) in cash and cash equivalents"])?.["Net increase (decrease) in cash and cash equivalents"]),
      effect_of_exchange_rate_changes: parseValue(sheet.records.find(r => r["Effect of exchange rate changes on cash and cash equivalents"])?.["Effect of exchange rate changes on cash and cash equivalents"]),
      net_increase_decrease_in_cash_and_equivalents: parseValue(sheet.records.find(r => r["Net increase (decrease) in cash and cash equivalents"])?.["Net increase (decrease) in cash and cash equivalents"]),
      cash_and_cash_equivalents_at_beginning: parseValue(sheet.records.find(r => r["Cash and cash equivalents cash flow statement at beginning of period"])?.["Cash and cash equivalents cash flow statement at beginning of period"])
    }));
   
  
    // Insert the data into the cash_statements table
    for (const record of formattedData) {
      try {
        const insertQuery = `
          INSERT INTO cash_statements (
            org_id, data_range, type, profit_before_tax, adjustments_for_depreciation_amortisation, adjustments_for_impairment_loss_reversal, 
            net_cash_flows_from_operations, dividends_received, interest_paid, interest_received, income_taxes_paid, other_inflows_outflows_of_cash, 
            net_cash_flows_from_operating_activities, proceeds_from_sales_of_property, purchase_of_property, proceeds_from_sales_of_intangible_assets, 
            purchase_of_intangible_assets, cash_receipts_from_repayment, dividends_received_in_investing, interest_received_in_investing, 
            net_cash_flows_from_investing_activities, proceeds_from_issuing_shares, proceeds_from_issuing_debentures, proceeds_from_borrowings, 
            repayments_of_borrowings, dividends_paid, interest_paid_in_financing, net_cash_flows_from_financing_activities, 
            net_increase_decrease_in_cash, effect_of_exchange_rate_changes, net_increase_decrease_in_cash_and_equivalents, 
            cash_and_cash_equivalents_at_beginning
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 
            $26, $27, $28, $29, $30, $31, $32
          )
        `;
        const values = [
          record.org_id, record.data_range, record.type, record.profit_before_tax, record.adjustments_for_depreciation_amortisation, 
          record.adjustments_for_impairment_loss_reversal, record.net_cash_flows_from_operations, record.dividends_received, record.interest_paid, 
          record.interest_received, record.income_taxes_paid, record.other_inflows_outflows_of_cash, record.net_cash_flows_from_operating_activities, 
          record.proceeds_from_sales_of_property, record.purchase_of_property, record.proceeds_from_sales_of_intangible_assets, 
          record.purchase_of_intangible_assets, record.cash_receipts_from_repayment, record.dividends_received_in_investing, 
          record.interest_received_in_investing, record.net_cash_flows_from_investing_activities, record.proceeds_from_issuing_shares, 
          record.proceeds_from_issuing_debentures, record.proceeds_from_borrowings, record.repayments_of_borrowings, record.dividends_paid, 
          record.interest_paid_in_financing, record.net_cash_flows_from_financing_activities, record.net_increase_decrease_in_cash, 
          record.effect_of_exchange_rate_changes, record.net_increase_decrease_in_cash_and_equivalents, record.cash_and_cash_equivalents_at_beginning
        ];
  
        await client.query(insertQuery, values);
        console.log(`Inserted record for data_range: ${record.data_range}, type: ${record.type}`);
      } catch (err) {
        console.error(`Error inserting record for data_range: ${record.data_range}, type: ${record.type}`, err);
      }
    }
  
    console.log('Data successfully inserted into cash_statements table.');
  } catch (error) {
    console.error("Error processing cash statement data:", error);
  } finally {
    await client.end();
  }
}

processCashStatementData();

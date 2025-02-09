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

function parseValue(value) {
  return (!value || value === '-' || value.trim() === '') 
    ? 0 
    : parseFloat(value.replace(/,/g, '')) || 0; // Remove commas before parsing
}

async function processBalanceSheetData() {
  try {
    // Read the org_id from org.json
    const orgJsonFilePath = path.join(__dirname, 'saved', 'org.json');
    const orgData = JSON.parse(fs.readFileSync(orgJsonFilePath, 'utf8'));
    const org_id = orgData.org_id;

    // Read the balance sheet data
    const jsonFilePath = path.join(__dirname, 'outputjson', 'restructured_data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    let balanceSheets = [];
    jsonData.data.forEach(entry => {
      if (entry.data.balance_sheet) {
        balanceSheets.push({ date_range: entry.date_range, type: "standalone", records: entry.data.balance_sheet });
      }
      if (entry.data.consolidated_balance_sheet) {
        balanceSheets.push({ date_range: entry.date_range, type: "consolidated", records: entry.data.consolidated_balance_sheet });
      }
    });

    const formattedData = balanceSheets.map(sheet => ({
      org_id: org_id,
      data_range: sheet.date_range,
      type: sheet.type,
      share_capital: parseValue(sheet.records.find(r => r["Share Capital"])?.["Share Capital"]),
      reserves_and_surplus: parseValue(sheet.records.find(r => r["Reserves & Surplus"])?.["Reserves & Surplus"]),
      networth: parseValue(sheet.records.find(r => r["Networth"])?.["Networth"]),
      long_term_borrowings: parseValue(sheet.records.find(r => r["Long-term Borrowings"])?.["Long-term Borrowings"]),
      deferred_tax_liabilities: parseValue(sheet.records.find(r => r["Deferred Tax Liabilities"])?.["Deferred Tax Liabilities"]),
      total_non_current_liabilities: parseValue(sheet.records.find(r => r["Total Non Current Liabilities"])?.["Total Non Current Liabilities"]),
      total_short_term_borrowings: parseValue(sheet.records.find(r => r["Total Short-term Borrowings"])?.["Total Short-term Borrowings"]),
      trade_payables: parseValue(sheet.records.find(r => r["Trade Payables"])?.["Trade Payables"]),
      total_current_liabilities: parseValue(sheet.records.find(r => r["Total Current Liabilities"])?.["Total Current Liabilities"]),
      tangible_assets: parseValue(sheet.records.find(r => r["Tangible Assets"])?.["Tangible Assets"]),
      net_block_of_assets: parseValue(sheet.records.find(r => r["Net Block of Assets"])?.["Net Block of Assets"]),
      total_fixed_asset: parseValue(sheet.records.find(r => r["Total Fixed Asset"])?.["Total Fixed Asset"]),
      total_non_current_assets: parseValue(sheet.records.find(r => r["Total Non Current Assets"])?.["Total Non Current Assets"]),
      inventories: parseValue(sheet.records.find(r => r["Inventories"])?.["Inventories"]),
      trade_receivables: parseValue(sheet.records.find(r => r["Trade Receivables"])?.["Trade Receivables"]),
      cash_and_cash_equivalents: parseValue(sheet.records.find(r => r["Cash & Cash Equivalents"])?.["Cash & Cash Equivalents"]),
      total_current_assets: parseValue(sheet.records.find(r => r["Total Current Assets"])?.["Total Current Assets"]),
      total_assets: parseValue(sheet.records.find(r => r["TOTAL ASSETS"])?.["TOTAL ASSETS"])
    }));
    
    
    // Insert the data into the balance_sheet table
    for (const record of formattedData) {
      const insertQuery = `
        INSERT INTO balance_sheet (
          org_id, data_range, type, share_capital, reserves_and_surplus, networth,
          long_term_borrowings, deferred_tax_liabilities, total_non_current_liabilities,
          total_short_term_borrowings, trade_payables, total_current_liabilities,
          tangible_assets, net_block_of_assets, total_fixed_asset, total_non_current_assets,
          inventories, trade_receivables, cash_and_cash_equivalents, total_current_assets, total_assets
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 
          $7, $8, $9, $10, $11, $12, 
          $13, $14, $15, $16, $17, $18, 
          $19, $20, $21
        )
      `;

      const values = [
        record.org_id, record.data_range, record.type,
        record.share_capital, record.reserves_and_surplus, record.networth,
        record.long_term_borrowings, record.deferred_tax_liabilities, record.total_non_current_liabilities,
        record.total_short_term_borrowings, record.trade_payables, record.total_current_liabilities,
        record.tangible_assets, record.net_block_of_assets, record.total_fixed_asset, record.total_non_current_assets,
        record.inventories, record.trade_receivables, record.cash_and_cash_equivalents, record.total_current_assets, record.total_assets
      ];

      await client.query(insertQuery, values);
      console.log(`Inserted record for data_range: ${record.data_range}, type: ${record.type}`);
    }

    console.log('Data successfully inserted into balance_sheet table.');
  } catch (error) {
    console.error("Error processing balance sheet data:", error);
  } finally {
    await client.end();
  }
}

processBalanceSheetData();

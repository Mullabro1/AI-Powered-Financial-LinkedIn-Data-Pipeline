import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import cors from 'cors';  // Importing CORS package
import pkg from 'pg';  // Importing the pg package correctly

const { Client } = pkg; // Destructuring Client from pg package

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;  // Set the port to 5000

// Use CORS middleware
app.use(cors());  // Allow all origins by default

// PostgreSQL client configuration (keep this connected once for the server's lifetime)
const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'excel',
  password: 'pass',
  port: 5433,
});

client.connect(); // Connect to PostgreSQL once at the start of the server

// Setup file upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'input')); // Save file into 'input' folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original file name
  }
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('File uploaded successfully:', req.file.originalname);

  try {
    // Execute the Python scripts first
    console.log('Starting execution of Python scripts...');
    const scripts = [
      '0_rename.py',
      '1_input_excel.py',
      '2_remap_excel.py',
      '3_delete_excel.py',
      '4_detect_table_profiles.py',
      '5_detect_table.py',
      '6_profile_extract.py',
      '7_column_checker_profile.py',
      '8_column_checker.py',
      '9_exceltojson.py',
      '10_exceltojson_profile.py',
      '11_finacial_fix.py',
      '12_restrut_json.py',
      '13_profile_remap.py',
      '14_final.py',
      '15_clear_cache.py'
    ];

    // Sequentially execute the scripts
    for (const script of scripts) {
      console.log(`Executing ${script}...`);
      const scriptPath = path.join(__dirname, script); // Directly in the same folder as server.js
      execSync(`python ${scriptPath}`, { stdio: 'inherit' });
    }

    console.log('Python scripts executed successfully!');
    // Execute the db scripts 
    console.log('Starting execution of db scripts...');
    const scripts2 = [
      'a_org.js',
      'b_balance.js',
      'c_profit_loss.js',
      'd_cash.js',
      'e_ratio.js'
    ];

    // Sequentially execute the scripts
    for (const script2 of scripts2) {
      console.log(`Executing ${script2}...`);  // Use script2 here instead of script
      const scriptPath2 = path.join(__dirname, script2); // Directly in the same folder as server.js
      execSync(`node ${scriptPath2}`, { stdio: 'inherit' });
    }


    console.log('db scripts executed successfully!');
    // If everything goes well, send success response
    res.status(200).send('File uploaded, organization and data saved successfully, and scripts executed!');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error executing scripts or saving data.');
  }
});


// API endpoint that accepts query parameters 'name' and 'data_range'
app.get('/fetchData', async (req, res) => {
  const orgName = req.query.name || "";  // Default name to empty string if not provided
  const dataRange = req.query.data_range || ""; // Default data range to empty string if not provided

  // Create SQL query based on the provided parameters
  const query = `
    SELECT 
        o.org_id,
        o.name AS organization_name,
        o.CIN,
        o.type AS org_type,
        o.status,
        o.corpository_sector,
        o.PAN,
        o.LEI,
        o.amount_type,
        o.email_id,
        o.website,
        o.telephone_number,
        
        -- Aggregate all columns from the balance_sheet table into JSON
        jsonb_agg(DISTINCT jsonb_build_object(
            'B_id', b.B_id,
            'balance_sheet_data_range', b.data_range,
            'balance_sheet_type', b.type,
            'share_capital', b.share_capital,
            'reserves_and_surplus', b.reserves_and_surplus,
            'networth', b.networth,
            'long_term_borrowings', b.long_term_borrowings,
            'deferred_tax_liabilities', b.deferred_tax_liabilities,
            'total_non_current_liabilities', b.total_non_current_liabilities,
            'total_short_term_borrowings', b.total_short_term_borrowings,
            'trade_payables', b.trade_payables,
            'total_current_liabilities', b.total_current_liabilities,
            'tangible_assets', b.tangible_assets,
            'net_block_of_assets', b.net_block_of_assets,
            'total_fixed_asset', b.total_fixed_asset,
            'total_non_current_assets', b.total_non_current_assets,
            'inventories', b.inventories,
            'trade_receivables', b.trade_receivables,
            'cash_and_cash_equivalents', b.cash_and_cash_equivalents,
            'total_current_assets', b.total_current_assets,
            'total_assets', b.total_assets
        )) AS balance_sheets,

        -- Aggregate all columns from the profit_loss table into JSON
        jsonb_agg(DISTINCT jsonb_build_object(
            'PL_id', p.PL_id,
            'profit_loss_data_range', p.data_range,
            'profit_loss_type', p.type,
            'revenue_from_sale_of_products', p.revenue_from_sale_of_products,
            'revenue_from_sale_of_services', p.revenue_from_sale_of_services,
            'total_revenue_from_operations', p.total_revenue_from_operations,
            'total_revenue', p.total_revenue,
            'cost_of_materials_consumed', p.cost_of_materials_consumed,
            'changes_in_inventories', p.changes_in_inventories,
            'total_employee_benefit_expense', p.total_employee_benefit_expense,
            'total_other_expenses', p.total_other_expenses,
            'EBITDA', p.EBITDA,
            'EBITDA_percent', p.EBITDA_percent,
            'total_depreciation_depletion_amortization', p.total_depreciation_depletion_amortization,
            'total_expenses', p.total_expenses,
            'profit_before_exceptional_and_extraordinary_items_and_tax', p.profit_before_exceptional_and_extraordinary_items_and_tax,
            'exceptional_items', p.exceptional_items,
            'profit_before_extraordinary_items_and_tax', p.profit_before_extraordinary_items_and_tax,
            'profit_before_tax', p.profit_before_tax,
            'tax_expense', p.tax_expense,
            'current_tax', p.current_tax,
            'deferred_tax', p.deferred_tax,
            'profit_loss_from_continuing_operations', p.profit_loss_from_continuing_operations,
            'profit_loss_from_discontinuing_operations', p.profit_loss_from_discontinuing_operations,
            'profit_loss', p.profit_loss
        )) AS profit_losses,

        -- Aggregate all columns from the cash_statements table into JSON
        jsonb_agg(DISTINCT jsonb_build_object(
            'CS_id', c.CS_id,
            'cash_statement_data_range', c.data_range,
            'cash_statement_type', c.type,
            'cash_profit_before_tax', c.profit_before_tax,
            'adjustments_for_depreciation_amortisation', c.adjustments_for_depreciation_amortisation,
            'adjustments_for_impairment_loss_reversal', c.adjustments_for_impairment_loss_reversal,
            'net_cash_flows_from_operations', c.net_cash_flows_from_operations,
            'dividends_received', c.dividends_received,
            'interest_paid', c.interest_paid,
            'interest_received', c.interest_received,
            'income_taxes_paid', c.income_taxes_paid,
            'other_inflows_outflows_of_cash', c.other_inflows_outflows_of_cash,
            'net_cash_flows_from_operating_activities', c.net_cash_flows_from_operating_activities,
            'proceeds_from_sales_of_property', c.proceeds_from_sales_of_property,
            'purchase_of_property', c.purchase_of_property,
            'proceeds_from_sales_of_intangible_assets', c.proceeds_from_sales_of_intangible_assets,
            'purchase_of_intangible_assets', c.purchase_of_intangible_assets,
            'cash_receipts_from_repayment', c.cash_receipts_from_repayment,
            'dividends_received_in_investing', c.dividends_received_in_investing,
            'interest_received_in_investing', c.interest_received_in_investing,
            'net_cash_flows_from_investing_activities', c.net_cash_flows_from_investing_activities,
            'proceeds_from_issuing_shares', c.proceeds_from_issuing_shares,
            'proceeds_from_issuing_debentures', c.proceeds_from_issuing_debentures,
            'proceeds_from_borrowings', c.proceeds_from_borrowings,
            'repayments_of_borrowings', c.repayments_of_borrowings,
            'dividends_paid', c.dividends_paid,
            'interest_paid_in_financing', c.interest_paid_in_financing,
            'net_cash_flows_from_financing_activities', c.net_cash_flows_from_financing_activities,
            'net_increase_decrease_in_cash', c.net_increase_decrease_in_cash,
            'effect_of_exchange_rate_changes', c.effect_of_exchange_rate_changes,
            'net_increase_decrease_in_cash_and_equivalents', c.net_increase_decrease_in_cash_and_equivalents,
            'cash_and_cash_equivalents_at_beginning', c.cash_and_cash_equivalents_at_beginning
        )) AS cash_statements,

        -- Aggregate all columns from the ratios table into JSON
        jsonb_agg(DISTINCT jsonb_build_object(
            'r_id', r.r_id,
            'ratio_data_range', r.data_range,
            'ratio_type', r.type,
            'revenue_growth', r.revenue_growth,
            'ebitda_margins', r.ebitda_margins,
            'ebt_margins', r.ebt_margins,
            'pat_margins', r.pat_margins,
            'return_on_equity', r.return_on_equity,
            'return_on_fixed_assets', r.return_on_fixed_assets,
            'return_on_capital_employed', r.return_on_capital_employed,
            'current_ratio', r.current_ratio,
            'quick_ratio', r.quick_ratio,
            'interest_coverage_ratio', r.interest_coverage_ratio,
            'long_term_debt_equity', r.long_term_debt_equity,
            'total_assets_equity', r.total_assets_equity,
            'total_debt_equity', r.total_debt_equity,
            'total_debt_total_assets', r.total_debt_total_assets,
            'total_debt_ebitda', r.total_debt_ebitda,
            'fixed_assets_turnover', r.fixed_assets_turnover,
            'total_asset_turnover', r.total_asset_turnover,
            'working_capital_turnover', r.working_capital_turnover,
            'inventory_days', r.inventory_days,
            'receivables_days', r.receivables_days,
            'payable_days', r.payable_days,
            'cash_conversion_cycle', r.cash_conversion_cycle,
            'raw_material_consumption', r.raw_material_consumption,
            'total_employee_cost', r.total_employee_cost,
            'finance_cost', r.finance_cost,
            'total_other_expenses', r.total_other_expenses
        )) AS ratios

    FROM 
        organization o
    LEFT JOIN balance_sheet b ON o.org_id = b.org_id AND (b.data_range = $2 OR $2 = '')
    LEFT JOIN profit_loss p ON o.org_id = p.org_id AND (p.data_range = $2 OR $2 = '')
    LEFT JOIN cash_statements c ON o.org_id = c.org_id AND (c.data_range = $2 OR $2 = '')
    LEFT JOIN ratios r ON o.org_id = r.org_id AND (r.data_range = $2 OR $2 = '')

    WHERE 
        o.name = $1
    GROUP BY 
        o.org_id;
  `;

  try {
    // Execute query with dynamic parameters
    const result = await client.query(query, [orgName, dataRange]);
    res.json(result.rows);  // Return the result as a JSON response
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Server error');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

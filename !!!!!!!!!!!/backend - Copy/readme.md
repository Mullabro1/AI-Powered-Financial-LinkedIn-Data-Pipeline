```sql
CREATE TABLE organization (
    org_id SERIAL PRIMARY KEY,
    CIN VARCHAR(255),
    name VARCHAR(255),
    type VARCHAR(255),
    status VARCHAR(255),
    corpository_sector VARCHAR(255),
    PAN VARCHAR(255),
    LEI VARCHAR(255),
    amount_type VARCHAR(255),
    email_id VARCHAR(255),           -- New column for Email ID
    website VARCHAR(255),            -- New column for Website
    telephone_number VARCHAR(15)     -- New column for Telephone Number
);

CREATE TABLE balance_sheet (
    B_id SERIAL PRIMARY KEY,                              -- Primary key for balance sheet
    org_id INT REFERENCES organization(org_id),           -- Foreign key referencing the organization table
    data_range VARCHAR(255),                               -- The data range for the balance sheet (now VARCHAR)
    type VARCHAR(255),                                     -- The type of balance sheet (e.g., annual, quarterly)
    share_capital DECIMAL(15, 2),                          -- Share Capital
    reserves_and_surplus DECIMAL(15, 2),                   -- Reserves & Surplus
    networth DECIMAL(15, 2),                               -- Networth
    long_term_borrowings DECIMAL(15, 2),                   -- Long-term Borrowings
    deferred_tax_liabilities DECIMAL(15, 2),               -- Deferred Tax Liabilities
    total_non_current_liabilities DECIMAL(15, 2),          -- Total Non Current Liabilities
    total_short_term_borrowings DECIMAL(15, 2),            -- Total Short-term Borrowings
    trade_payables DECIMAL(15, 2),                         -- Trade Payables
    total_current_liabilities DECIMAL(15, 2),              -- Total Current Liabilities
    tangible_assets DECIMAL(15, 2),                        -- Tangible Assets
    net_block_of_assets DECIMAL(15, 2),                    -- Net Block of Assets
    total_fixed_asset DECIMAL(15, 2),                      -- Total Fixed Asset
    total_non_current_assets DECIMAL(15, 2),               -- Total Non Current Assets
    inventories DECIMAL(15, 2),                            -- Inventories
    trade_receivables DECIMAL(15, 2),                      -- Trade Receivables
    cash_and_cash_equivalents DECIMAL(15, 2),               -- Cash & Cash Equivalents
    total_current_assets DECIMAL(15, 2),                   -- Total Current Assets
    total_assets DECIMAL(15, 2)                            -- Total Assets
);


CREATE TABLE profit_loss (
    PL_id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organization(org_id),
    data_range VARCHAR(255),
    type VARCHAR(255),
    revenue_from_sale_of_products DECIMAL(15, 2),
    revenue_from_sale_of_services DECIMAL(15, 2),
    total_revenue_from_operations DECIMAL(15, 2),
    total_revenue DECIMAL(15, 2),
    cost_of_materials_consumed DECIMAL(15, 2),
    changes_in_inventories DECIMAL(15, 2),
    total_employee_benefit_expense DECIMAL(15, 2),
    total_other_expenses DECIMAL(15, 2),
    EBITDA DECIMAL(15, 2),
    EBITDA_percent DECIMAL(5, 2),
    total_depreciation_depletion_amortization DECIMAL(15, 2),
    total_expenses DECIMAL(15, 2),
    profit_before_exceptional_and_extraordinary_items_and_tax DECIMAL(15, 2),
    exceptional_items DECIMAL(15, 2),
    profit_before_extraordinary_items_and_tax DECIMAL(15, 2),
    profit_before_tax DECIMAL(15, 2),
    tax_expense DECIMAL(15, 2),
    current_tax DECIMAL(15, 2),
    deferred_tax DECIMAL(15, 2),
    profit_loss_from_continuing_operations DECIMAL(15, 2),
    profit_loss_from_discontinuing_operations DECIMAL(15, 2),
    profit_loss DECIMAL(15, 2)
);

CREATE TABLE cash_statements (
    CS_id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organization(org_id),
    data_range VARCHAR(255),
    type VARCHAR(255),
    profit_before_tax DECIMAL(15, 2),
    adjustments_for_depreciation_amortisation DECIMAL(15, 2),
    adjustments_for_impairment_loss_reversal DECIMAL(15, 2),
    net_cash_flows_from_operations DECIMAL(15, 2),
    dividends_received DECIMAL(15, 2),
    interest_paid DECIMAL(15, 2),
    interest_received DECIMAL(15, 2),
    income_taxes_paid DECIMAL(15, 2),
    other_inflows_outflows_of_cash DECIMAL(15, 2),
    net_cash_flows_from_operating_activities DECIMAL(15, 2),
    proceeds_from_sales_of_property DECIMAL(15, 2),
    purchase_of_property DECIMAL(15, 2),
    proceeds_from_sales_of_intangible_assets DECIMAL(15, 2),
    purchase_of_intangible_assets DECIMAL(15, 2),
    cash_receipts_from_repayment DECIMAL(15, 2),
    dividends_received_in_investing DECIMAL(15, 2),
    interest_received_in_investing DECIMAL(15, 2),
    net_cash_flows_from_investing_activities DECIMAL(15, 2),
    proceeds_from_issuing_shares DECIMAL(15, 2),
    proceeds_from_issuing_debentures DECIMAL(15, 2),
    proceeds_from_borrowings DECIMAL(15, 2),
    repayments_of_borrowings DECIMAL(15, 2),
    dividends_paid DECIMAL(15, 2),
    interest_paid_in_financing DECIMAL(15, 2),
    net_cash_flows_from_financing_activities DECIMAL(15, 2),
    net_increase_decrease_in_cash DECIMAL(15, 2),
    effect_of_exchange_rate_changes DECIMAL(15, 2),
    net_increase_decrease_in_cash_and_equivalents DECIMAL(15, 2),
    cash_and_cash_equivalents_at_beginning DECIMAL(15, 2)
);


CREATE TABLE ratios (
    r_id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organization(org_id),
    data_range VARCHAR(255),
    type VARCHAR(255),
    revenue_growth DECIMAL(15, 2),
    ebitda_margins DECIMAL(15, 2),
    ebt_margins DECIMAL(15, 2),
    pat_margins DECIMAL(15, 2),
    return_on_equity DECIMAL(15, 2),
    return_on_fixed_assets DECIMAL(15, 2),
    return_on_capital_employed DECIMAL(15, 2),
    current_ratio DECIMAL(15, 2),
    quick_ratio DECIMAL(15, 2),
    interest_coverage_ratio DECIMAL(15, 2),
    long_term_debt_equity DECIMAL(15, 2),
    total_assets_equity DECIMAL(15, 2),
    total_debt_equity DECIMAL(15, 2),
    total_debt_total_assets DECIMAL(15, 2),
    total_debt_ebitda DECIMAL(15, 2),
    fixed_assets_turnover DECIMAL(15, 2),
    total_asset_turnover DECIMAL(15, 2),
    working_capital_turnover DECIMAL(15, 2),
    inventory_days DECIMAL(15, 2),
    receivables_days DECIMAL(15, 2),
    payable_days DECIMAL(15, 2),
    cash_conversion_cycle DECIMAL(15, 2),
    raw_material_consumption DECIMAL(15, 2),
    total_employee_cost DECIMAL(15, 2),
    finance_cost DECIMAL(15, 2),
    total_other_expenses DECIMAL(15, 2)
);



-- Create data_org table with modified column sizes
CREATE TABLE data_org (
    d_id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organization(org_id),  -- Reference to organization table
    date_range VARCHAR(255),  -- Increased size to 255
    data JSONB
);

-- Drop tables if they exist, along with dependent objects
DROP TABLE IF EXISTS organization, data_org CASCADE;
--to see all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('organization', 'balance_sheet', 'profit_loss', 'cash_statements', 'ratios');


```
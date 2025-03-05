===============
# OVERVIEW
===============

** Use Powershell Commands when initiating terminal commands. The user is on a Windows PC. **

Project Name: 401(k) Payment Tracking System

Purpose:
This desktop app replaces an existing Excel-based process for tracking 401(k) plan payments at Hohimer Wealth Management (HH). HH, a financial advisory firm, manages investment options, compliance, and strategic oversight of 401(k) plans for approximately 30 client companies. Throughout the year, HH receives and must accurately track various service-related payments from providers (John Hancock, Voya, etc.) and directly from clients. The app ensures efficient, error-free payment tracking and simplifies record-keeping, compliance reviews, and related documentation management. Designed exclusively for local, offline use on workplace PCs, the app requires no internet connectivity, user authentication, or security considerations. All files are managed through a shared local OneDrive system.

Technology Framework:
- Local desktop application (Windows PCs only)
- Max of 5 non-concurrent users
- SQLite Database
- Python backend with FastAPI
- Direct SQL queries - no ORM.
- React/Next.js frontend with Tailwind CSS. Various components from Radix UI and Shadcn UI.

Key Features:
- Record, edit, and delete payment entries quickly and accurately
- Display quarterly and historical payment data clearly
- Provide key insights and performance metrics at a glance
- Easily view client, contract, and contact information
- Calculate expected fees and highlight discrepancies proactively
- Link and manage relevant documents (PDF, Word, scans) from local OneDrive storage for easy compliance verification
- Export data seamlessly into formatted Excel documents
- Intuitive, user-friendly interface requiring minimal training
- Reliable performance for managing 30-50 clients and roughly 300 annual payments

Logic / Details / Journal: 
- OneDrive Integration: local filesystem access to synced OneDrive folders that appear as a standard drive in File Explorer.  Use Python's built-in os and pathlib libraries for file operations - no special OneDrive SDK needed
- All payments in arrears. One month back for monthly, one quarter back for quarterly 
- precent_rate is recorded as per period rate (monthly or quarterly), convert as necessary to display monthly, quarterly, annual. 
- the database is already created with the schema and populated with data, and will reside in the project directory
- API Endpoint Structure: Standard RESTful FastAPI routes needed for CRUD operations on payments, clients, contracts, files, and contacts, with client-specific snapshot endpoints returning aggregated data from multiple tables.



============================
BLUEPRINT
============================
(see SCHEMA at the end) 

---------------------------------------
# TOP NAVIGATION BAR 
---------------------------------------

Displays pages with minimalistic icons:
- Payments (import PaymentsIcon from '@mui/icons-material/Payments';)
- Summary (import DashboardIcon from '@mui/icons-material/Dashboard';)
- Contacts (import PeopleAltIcon from '@mui/icons-material/PeopleAlt';)
- Contracts (import ArticleIcon from '@mui/icons-material/Article';)
- Export Data (import FileDownloadIcon from '@mui/icons-material/FileDownload';)

---------------------------------------
PAGE: PAYMENTS 
---------------------------------------

//////// (I) SIDEBAR -- CLIENT SECTIONS ////////

Fixed width and position with straightforward click-to-select interaction.
Contains a scrollable list of clients, sorted alphabetically by default or grouped by provider.
Includes a dynamic search bar for live filtering.
Clearly displays compliance status per client with color-coded indicators (green, yellow, red).
Allows toggling between alphabetical and provider-based client organization; provider sections are collapsible, showing nested clients.
Provides subtle hover and active selection effects for visual feedback.
Applies ellipsis truncation to client names only when necessary.
//////// (II) CLIENT SNAPSHOT SECTION ////////
- Displays stable client details compiled from various database tables, providing essential, quick-reference information.

Client Full Name: [full_name]
IMA Signed Date: [ima_signed_date]
Provider: [provider_name]
Contract #: [contract_number]
Contract Start Date: [contract_start_date]
Payment Schedule: [payment_schedule] (Monthly/Quarterly)
Fee Type: [fee_type]
Fee Structure: [percent_rate]% or $[flat_rate] > Monthly: $[calculated monthly amount] > Quarterly: $[calculated quarterly amount] > Annual: $[calculated annual amount]
Plan Participants: [num_people]


//////// (III) PAYMENT HISTORY SNAPSHOT ////////
- Quick reference of recent payment activity, providing context for payment entry and ensuring recent payments exist for compliance.

Last Payment:
Date: [received_date]
Amount: $[actual_fee]
Period: [quarter/month] [year]

Average Payment (YTD): $[avg_quarterly_payment]

Total Payments (YTD): $[total_ytd_payments]

Last Recorded AUM: $[last_recorded_assets]

//////// (IV) ADD PAYMENT -- ENTRY PANEL ////////

Central form for inputting payment details. Simple, intuitive fields minimize errors and adapt to the selected client.
4.1. Received Date (Required):
- Standard date picker.
- Description: Date payment was received.
- Defaults to today's date.
- Format: MM/DD/YYYY.
- Future dates are not permitted.
- Database impact: stores selected date directly into payments.received_date.

4.2. Applied {period} (Required):
- Split-Payment Toggle: Defaults to OFF. Controls single or multi-period payment application.

IF OFF (Single Period):
Displays Applied Month/Quarter.
Label ("Month" or "Quarter") matches client's payment schedule.
Arrear logic: Displays periods starting from client's inception up to one period before current month/quarter.
Default option: earliest allowed period (assumes payments are typically on time).
Future periods are invalid.
Format:
Months: integer (1-12), Year: YYYY
Quarters: integer (1-4), Year: YYYY
Examples: 1. Monthly: Payment received on 2019-05-03 populates fields:
applied_start_month = 4, applied_start_month_year = 2019
applied_end_month = 4, applied_end_month_year = 2019 2. Quarterly: Payment received on 2024-02-22 populates fields:
applied_start_quarter = 4, applied_start_quarter_year = 2023
applied_end_quarter = 4, applied_end_quarter_year = 2023

IF ON (Split Payment):
Displays Applied Start Month/Quarter and Applied End Month/Quarter.
Defaults to identical start and end periods (single-period entry); user can adjust.
Labels, available periods, and formatting follow same logic as above.
Payment Splitting: Total amount is evenly distributed across selected period range.
Examples: 1. Monthly: Payment received on 2019-05-03 for Feb-Apr 2019 evenly splits across these three months. 2. Quarterly: Payment received on 2024-02-22 for quarters 2-4 of 2023 evenly splits across these three quarters.

4.3. Assets Under Management (AUM) (Optional):
- Currency input mask.
- Description: Total value of assets managed for the client.
- Includes dollar sign ($).
- Uses thousand separators (commas).
- Two decimal places.
- Accepts numeric characters only.
- Maximum permitted value: $1,000,000,000.00.
- Input mask auto-formats value as entered.
- Database impact: [table: payments] [field: total_assets].
- Note: AUM remains optional for flexibility, preventing data-entry friction. Users can update AUM later via EDIT PAYMENT.

4.4. Payment Amount (Required):
- Currency input mask.
- Description: Amount of the payment received.
- Includes dollar sign ($).
- Uses thousand separators (commas).
- Two decimal places.
- Accepts numeric characters only.
- Maximum permitted value: $100,000.00.
- Input mask auto-formats value as entered.
- Database impact: [table: payments] [field: actual_fee].

4.5. Payment Method (Optional):
- Dropdown selector.
- Description: Means of payment (ACH, Check, etc.).
- Options:
  - {{blank}} (Default)
  - Auto - Check
  - Auto - ACH
  - Invoice - Check
  - Wire Transfer
  - Check
  - None Specified
  - Other
- Selecting "Other" displays an additional text input for manual entry.
- Database impact: [table: payments] [field: method].

4.6. Notes (Optional):
- Text area.
- Description: Additional notes or comments regarding the payment.
- Allows multi-line input.
- No character limit.
- Database impact: [table: payments] [field: notes].

4.7. ATTACH FILE (Document) (import AttachFileIcon from '@mui/icons-material/AttachFile';)
- Allows attaching supporting documents directly to payments.
- Supported file types: PDF, PNG, JPEG, JPG, TIFF, WEBP, DOCX, DOC, CSV, XLS, XLSX, TXT.
- Files uploaded via standard Windows file explorer dialog.
Upon upload:
    - File is uploaded directly to client's OneDrive root directory via Python backend.
    - Backend records file details (file_name, onedrive_path) into the client_files table.
    - Backend associates the new file to the specific payment by creating a corresponding entry in the payment_files junction table.
- Visual confirmation shows truncated file path (parent/parent/file).
- Users may attach multiple files; files appear stacked visually with an "X" icon for easy removal.

ADD PAYMENT Actions:
- Clear:
  - If no changes have been made from the default state, pressing "Clear" has no effect.
  - If changes exist, displays confirmation prompt:
    - Selecting "Yes" resets the form to default state.
    - Selecting "No" returns to the previously entered state.
- Submit:
  - Validates required fields are completed.
  - Ensures numeric fields are correctly formatted.
  - If validation succeeds, records payment and displays success confirmation.
  - Submitting an empty form triggers an error prompting the user to complete required fields.
  - Basic protections prevent duplicate rapid submissions.

ENTRY VALIDATION:
- Dynamic, real-time display closely related to payment entry (can be integrated or shown separately).
- Applied Period(s): Shows selected month(s)/quarter(s) the payment will cover.
  - Example: "Applied Period(s): JAN 1 2020: $1,000.00 | FEB 1 2020: $1,000.00 | Total: $2,000.00"
  - Expected Fee (calculated as: AUM * rate): $[calculated]
  - Payment Variance: $[difference] ([percentage]%)
  - Color indicator: green (within 5%), yellow (5-15%), red (>15%)

//////// (V) PAYMENT HISTORY TABLE ////////
- Fixed-size table occupying bottom section of the page.
- Displays 20 rows per page with standard pagination controls ("< << >> >") below the table.
- Each row displays payment history details with "VIEW FILES", "EDIT", "DELETE" action buttons.

5.1 PAYMENT HISTORY TABLE - FIELDS:
- All fields formatted for readability; currency includes dollar signs and commas.

Client Name
Provider
AUM (formatted with dollar signs, commas, no decimals due to large values)
Payment Schedule: [payment_schedule] (Monthly/Quarterly)
Fee Structure: [fee_type] ([percent_rate]% or $[flat_rate])
Received Date
Applied Period
Expected Fee
Actual Payment Amount
(depending on if a file is attached) VIEW ATTACHMENTS (import FindInPageIcon from '@mui/icons-material/FindInPage';)
EDIT PAYMENT (import EditIcon from '@mui/icons-material/Edit';)
DELETE PAYMENT (import DeleteIcon from '@mui/icons-material/Delete';)
## PAYMENT HISTORY TABLE ACTIONS:  "VIEW ATTACHMENTS",  "EDIT" and "DELETE" actions.

### FOR SPLIT PAYMENT ENTRIES: Show the entire payment in the table but with an expandable view of the individual applied periods and amounts.


 VIEW ATTACHED FILE:

(see Payment Document Preview section)

EDIT:
  - Opens payment form in "edit mode," pre-filled with existing details.
  - Options available during edit mode:
    - Submit Edit:
      - Validates form, updates payment details, displays success message, and returns form to default "Add Payment" state.
    - Cancel Edit:
      - If changes exist, displays confirmation prompt:
        - Selecting "Yes" discards changes, reverting to default "Add Payment" mode.
        - Selecting "No" continues editing.

Delete:
  - Asks delete payment confirmation: a) if yes, the payment immediately removes from payment table display and database. b) if no, nothing changes. standard practice.    

Handling State Changes:
Switching from "Add Payment" to "Edit Payment":
If "Add Payment" form has unsaved input, confirmation prompts user:
Selecting "Yes" discards changes and enters edit mode.
Selecting "No" maintains current "Add Payment" entry.
Switching between edits:
Any unsaved changes trigger confirmation before discarding.
Standard confirmation behaviors apply whenever user actions might result in loss of entered data.
//////// (IV) ADD PAYMENT — ENTRY PANEL ////////

4.7 ATTACH FILE (Document) (import AttachFileIcon from '@mui/icons-material/AttachFile';)  
- Allows attaching supporting documents directly to payments.
- Supported file types: PDF, PNG, JPEG, JPG, TIFF, WEBP, DOCX, DOC, CSV, XLS, XLSX, TXT.
- Files uploaded via standard Windows file explorer dialog.
- Upon upload:
  - File is uploaded directly to client's OneDrive root directory via Python backend.
  - Backend records file details (file_name, onedrive_path) into the client_files table.
  - Backend associates the new file to the specific payment by creating a corresponding entry in the payment_files junction table.
- Visual confirmation shows truncated file path (parent/parent/file).
- Users may attach multiple files; files appear stacked visually with an "X" icon for easy removal.

//////// DOCUMENT VIEWER SIDE PANEL ////////

An expandable panel that slides in from the right side of the application. The panel appears in two different contexts depending on how it's accessed.

## DATABASE INTEGRATION

Two tables handle file tracking and associations:

CREATE TABLE "client_files" (
    "file_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "onedrive_path" TEXT NOT NULL,
    "uploaded_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("file_id" AUTOINCREMENT),
    FOREIGN KEY("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE
)

CREATE TABLE "payment_files" (
    "payment_id" INTEGER NOT NULL,
    "file_id" INTEGER NOT NULL,
    "linked_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("payment_id", "file_id"),
    FOREIGN KEY("payment_id") REFERENCES "payments"("payment_id") ON DELETE CASCADE,
    FOREIGN KEY("file_id") REFERENCES "client_files"("file_id") ON DELETE CASCADE
)

## CLIENT DOCUMENT VIEW

ACCESS:
- Triggered by clicking "Documents" button in Client Snapshot section

NAVIGATION:
- Folder-tree structure displaying files from client's OneDrive root folder
- Single-click folders to expand/collapse
- Single-click files to preview
- Files linked to payments have distinct icon/color
- Search bar filters files by name/extension

PREVIEW:
- Large preview pane showing selected document
- Next/previous buttons to navigate between files
- Toggle for side-by-side comparison (up to two files)
- Supports PDF, images, Office documents, text files

FILE ACTIONS:
- Upload files (drag-and-drop or file dialog)
- Delete files
- Link/unlink files to payments

## PAYMENT DOCUMENT VIEW

ACCESS:
- Triggered by clicking "VIEW ATTACHMENTS" in Payment History Table

NAVIGATION:
- Simple list of files linked to the selected payment
- No folder-tree structure
- Files sorted by most recent first
- "Show All Client Files" button to expand view

PREVIEW:
- Same preview functionality as Client Document View
- Shows one file at a time with navigation controls
- Side-by-side comparison available

FILE ACTIONS:
- Upload new files (automatically added to the payment folder)
- Unlink files from payment
- Link existing client files to current payment

## BACKEND OPERATIONS

FILE SCANNING:
- Python backend scans client OneDrive folders
- Populates client_files table with metadata
- Updates after file operations

FILE HANDLING:
- Upload: Add file to OneDrive + create database entries
- Delete: Remove from OneDrive + remove from database
- Link/Unlink: Update payment_files table only

UPLOAD PATHS:
- Client uploads: User selects destination in client folders
- Payment uploads: Automatic path to {client}/payments/ folder
---

---------------------------------------
PAGE: SUMMARY
---------------------------------------
- Display text "UNDER CONSTRUCTION"

---------------------------------------
PAGE: CONTACTS
---------------------------------------
- Display text "UNDER CONSTRUCTION"

---------------------------------------
PAGE: CONTRACTS
---------------------------------------
- Display text "UNDER CONSTRUCTION"

---------------------------------------
PAGE: EXPORT DATA
---------------------------------------
- Display text "UNDER CONSTRUCTION"

---

============================
SQLite SCHEMA -- FOR REFERENCE (Remember: the database is already created with the schema and populated with data, and will reside in the project directory)
============================

CREATE TABLE sqlite_sequence(name,seq)
CREATE TABLE quarterly_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    total_payments REAL,
    total_assets REAL,
    payment_count INTEGER,
    avg_payment REAL,
    expected_total REAL,
    last_updated TEXT,
    FOREIGN KEY(client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    UNIQUE(client_id, year, quarter)
)
CREATE TABLE yearly_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_payments REAL,
    total_assets REAL,
    payment_count INTEGER,
    avg_payment REAL,
    yoy_growth REAL,
    last_updated TEXT,
    FOREIGN KEY(client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    UNIQUE(client_id, year)
)
CREATE TABLE contacts (
    contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    contact_type TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    fax TEXT,
    physical_address TEXT,
    mailing_address TEXT,
    valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    valid_to DATETIME,
    FOREIGN KEY(client_id) REFERENCES clients(client_id) ON DELETE CASCADE
)
CREATE INDEX idx_quarterly_lookup ON quarterly_summaries(client_id, year, quarter)
CREATE INDEX idx_yearly_lookup ON yearly_summaries(client_id, year)
CREATE INDEX idx_contacts_client_id ON contacts(client_id)
CREATE INDEX idx_contacts_type ON contacts(client_id, contact_type)
CREATE TABLE "contracts" (
    "contract_id"    INTEGER NOT NULL,
    "client_id"    INTEGER NOT NULL,
    "contract_number"    TEXT,
    "provider_name"    TEXT,
    "contract_start_date"    TEXT,
    "fee_type"    TEXT,
    "percent_rate"    REAL,
    "flat_rate"    REAL,
    "payment_schedule"    TEXT,
    "num_people"    INTEGER,
    "notes"    TEXT,
    "valid_from"    DATETIME DEFAULT CURRENT_TIMESTAMP,
    "valid_to"    DATETIME,
    PRIMARY KEY("contract_id" AUTOINCREMENT),
    FOREIGN KEY("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE
)
CREATE INDEX idx_contracts_client_id ON contracts(client_id)
CREATE INDEX idx_contracts_provider ON contracts(provider_name)
CREATE TABLE "client_metrics" (
    "id"    INTEGER NOT NULL,
    "client_id"    INTEGER NOT NULL,
    "last_payment_date"    TEXT,
    "last_payment_amount"    REAL,
    "last_payment_quarter"    INTEGER,
    "last_payment_year"    INTEGER,
    "total_ytd_payments"    REAL,
    "avg_quarterly_payment"    REAL,
    "last_recorded_assets"    REAL,
    "last_updated"    TEXT,
    UNIQUE("client_id"),
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE
)
CREATE INDEX idx_client_metrics_lookup ON client_metrics(client_id)
CREATE TRIGGER update_yearly_after_quarterly
    AFTER INSERT ON quarterly_summaries
    BEGIN
        INSERT OR REPLACE INTO yearly_summaries 
        (client_id, year, total_payments, total_assets, payment_count, avg_payment, yoy_growth, last_updated)
        SELECT 
            client_id, 
            year, 
            SUM(total_payments), 
            AVG(total_assets), 
            SUM(payment_count), 
            AVG(avg_payment),
            NULL,
            datetime('now')
        FROM quarterly_summaries 
        WHERE client_id = NEW.client_id 
            AND year = NEW.year
        GROUP BY client_id, year;
    END
CREATE TABLE "payments" (
    "payment_id"    INTEGER NOT NULL,
    "contract_id"    INTEGER NOT NULL,
    "client_id"    INTEGER NOT NULL,
    "received_date"    TEXT,
    "total_assets"    INTEGER,
    "expected_fee"    REAL,
    "actual_fee"    REAL,
    "method"    TEXT,
    "notes"    TEXT,
    "split_group_id"    TEXT,
    "valid_from"    DATETIME DEFAULT CURRENT_TIMESTAMP,
    "valid_to"    DATETIME,
    "applied_start_month"    INTEGER,
    "applied_start_month_year"    INTEGER,
    "applied_end_month"    INTEGER,
    "applied_end_month_year"    INTEGER,
    "applied_start_quarter"    INTEGER,
    "applied_start_quarter_year"    INTEGER,
    "applied_end_quarter"    INTEGER,
    "applied_end_quarter_year"    INTEGER,
    PRIMARY KEY("payment_id" AUTOINCREMENT),
    FOREIGN KEY("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE,
    FOREIGN KEY("contract_id") REFERENCES "contracts"("contract_id") ON DELETE CASCADE
)
CREATE INDEX idx_payments_client_id ON payments(client_id)
CREATE INDEX idx_payments_contract_id ON payments(contract_id)
CREATE INDEX idx_payments_date ON payments(client_id, received_date DESC)
CREATE INDEX idx_payments_split_group ON payments(split_group_id)
CREATE TRIGGER update_quarterly_after_payment
AFTER INSERT ON payments
BEGIN
    INSERT OR REPLACE INTO quarterly_summaries 
    (client_id, year, quarter, total_payments, total_assets, payment_count, avg_payment, expected_total, last_updated)
    SELECT 
        client_id, 
        applied_start_quarter_year, 
        applied_start_quarter, 
        SUM(actual_fee), 
        AVG(total_assets), 
        COUNT(*), 
        AVG(actual_fee), 
        MAX(expected_fee), 
        datetime('now')
    FROM payments 
    WHERE client_id = NEW.client_id 
      AND applied_start_quarter_year = NEW.applied_start_quarter_year 
      AND applied_start_quarter = NEW.applied_start_quarter
    GROUP BY client_id, applied_start_quarter_year, applied_start_quarter;
END
CREATE TABLE "clients" (
    "client_id"    INTEGER NOT NULL,
    "display_name"    TEXT NOT NULL,
    "full_name"    TEXT,
    "ima_signed_date"    TEXT,
    "onedrive_folder_path"    TEXT,
    "valid_from"    DATETIME DEFAULT CURRENT_TIMESTAMP,
    "valid_to"    DATETIME,
    PRIMARY KEY("client_id" AUTOINCREMENT)
)
CREATE TABLE "client_files" (
    "file_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "onedrive_path" TEXT NOT NULL,
    "uploaded_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("file_id" AUTOINCREMENT),
    FOREIGN KEY("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE
)
CREATE TABLE "payment_files" (
    "payment_id" INTEGER NOT NULL,
    "file_id" INTEGER NOT NULL,
    "linked_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("payment_id", "file_id"),
    FOREIGN KEY("payment_id") REFERENCES "payments"("payment_id") ON DELETE CASCADE,
    FOREIGN KEY("file_id") REFERENCES "client_files"("file_id") ON DELETE CASCADE
)

```
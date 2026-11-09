# UNIMAK WIP STOCK MANAGEMENT SYSTEM - SYSTEM REQUIREMENTS SPECIFICATION

**Client Organization:** Unimak (Pvt) Ltd  
**Division:** Metal Packaging & Tinplate Decorating Manufacturing  
**Application Title:** UNIMAK WIP STOCK MANAGEMENT SYSTEM  

---

## 1. Runtime & Environment Requirements

### Web Application Stack (Primary Production)
- **Runtime:** Node.js `>= 18.0.0` or `>= 20.0.0`
- **Package Manager:** npm `>= 9.0.0` or bun `>= 1.0.0`
- **Framework:** React 19 / TypeScript 5.8+
- **Bundler:** Vite 6+
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with Dark Mode custom variants
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) & Atomic RPCs
- **Charts:** Recharts 2.15+
- **Document & Spreadsheet Export:** XLSX (ExcelJS compatible) & jsPDF / jsPDF-AutoTable

### Optional Python Utilities & Administration CLI
- **Python Version:** Python `>= 3.9`
- **Dependencies (`requirements.txt`):**
  - `supabase>=2.3.0` (Remote PostgreSQL API connectivity)
  - `psycopg2-binary>=2.9.9` (Direct SQL driver)
  - `pandas>=2.2.0` (Tabular data manipulation & reconciliation)
  - `openpyxl>=3.1.2` (Excel generation)
  - `xlsxwriter>=3.1.9` (Advanced Excel formatting)
  - `reportlab>=4.1.0` (PDF document generator)
  - `python-dotenv>=1.0.1` (Environment variable loading)
  - `requests>=2.31.0` (HTTP client)
  - `pydantic>=2.6.0` (Data validation)
  - `rich>=13.7.0` (Terminal styling & tables)

---

## 2. Browser Compatibility
- Google Chrome `>= 90` (Desktop, Tablet, Mobile)
- Mozilla Firefox `>= 88`
- Apple Safari `>= 14`
- Microsoft Edge `>= 90`
- Responsive layout supporting Desktop (1920×1080, 1366×768), Tablet (iPad 1024×768), and Mobile (375px+).

---

## 3. Database & SQL Requirements
- **PostgreSQL Version:** 14, 15, or 16
- **Schema Migration File:** `/supabase/migrations/001_initial_schema.sql`
- **Required Database Extensions:** `uuid-ossp`
- **Security:** Supabase Row Level Security (RLS) enabled on all tables:
  - `public.jobs`
  - `public.items`
  - `public.sheet_sizes`
  - `public.coating_types`
  - `public.factories`
  - `public.coating_receipts`
  - `public.factory_issues`
  - `public.quality_returns`
  - `public.audit_logs`
- **Stored Procedures:**
  - `approve_quality_return(p_return_id, p_approver_id, p_approver_name)`
  - `get_auth_role()`

---

## 4. Role-Based Access Control (RBAC)
1. **Administrator:**
   - Full access across all modules
   - Manage Master Data (Jobs, Items, Sizes, Coatings, Factories)
   - Provision & activate/deactivate user accounts
   - Review and approve/return Quality Return submissions
   - Perform controlled transaction reversals with mandatory reasons
   - View complete immutable audit logs
2. **Quality Department:**
   - Create, edit, and submit Quality Return records for Printing Line batches
   - View approval status
   - Restricted from approving self-submissions
   - Restricted from creating Coating Receipts or issuing stock
   - Restricted from editing Master Data or system settings
3. **Viewer:**
   - Read-only access to Dashboard, Master Data, Coating Stock Summary, Printing Stock, and Reports
   - Report export permitted only when granted by Administrator

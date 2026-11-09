-- ==============================================================================
-- UNIMAK WIP STOCK MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA & ATOMIC PROCEDURES
-- Company: Unimak (Pvt) Ltd - Metal Packaging Manufacturing
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Master Data Tables
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(100) UNIQUE NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(100) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    sheet_size VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(50) DEFAULT 'Sheets' NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sheet_sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    size VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coating_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_printing_line BOOLEAN DEFAULT FALSE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. User Profiles & RBAC
CREATE TYPE user_role_enum AS ENUM ('Administrator', 'Quality Department', 'Viewer');

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'Viewer',
    department VARCHAR(100) DEFAULT 'Manufacturing' NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    can_export_reports BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login TIMESTAMPTZ
);

-- 4. Transactions: Coating Receiving
CREATE TYPE side_config_enum AS ENUM ('Single', 'Double');

CREATE TABLE IF NOT EXISTS public.coating_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    receiving_date DATE NOT NULL,
    job_id UUID NOT NULL REFERENCES public.jobs(id),
    job_number VARCHAR(100) NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    coating_batch_card_number VARCHAR(100) UNIQUE NOT NULL,
    item_id UUID NOT NULL REFERENCES public.items(id),
    item_code VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    sheet_size VARCHAR(100) NOT NULL,
    coating_combination VARCHAR(255) NOT NULL,
    side_configuration side_config_enum NOT NULL DEFAULT 'Single',
    received_quantity INT NOT NULL CHECK (received_quantity > 0),
    remarks TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_by_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_reversed BOOLEAN DEFAULT FALSE NOT NULL,
    reversed_reason TEXT,
    reversed_at TIMESTAMPTZ,
    reversed_by UUID REFERENCES auth.users(id)
);

-- 5. Transactions: Issuing to Factories
CREATE TYPE issue_type_enum AS ENUM ('Coated Sheet Issue', 'Approved Printed Sheet Issue');

CREATE TABLE IF NOT EXISTS public.factory_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_number VARCHAR(100) UNIQUE NOT NULL,
    issue_type issue_type_enum NOT NULL,
    issue_date DATE NOT NULL,
    job_id UUID NOT NULL REFERENCES public.jobs(id),
    job_number VARCHAR(100) NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    destination_factory VARCHAR(100) NOT NULL,
    is_printing_line BOOLEAN DEFAULT FALSE NOT NULL,
    item_id UUID NOT NULL REFERENCES public.items(id),
    item_code VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    sheet_size VARCHAR(100) NOT NULL,
    coating_combination VARCHAR(255) NOT NULL,
    side_configuration side_config_enum NOT NULL DEFAULT 'Single',
    coating_batch_card_number VARCHAR(100) NOT NULL,
    printing_batch_card_number VARCHAR(100),
    issue_quantity INT NOT NULL CHECK (issue_quantity > 0),
    remarks TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_by_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_reversed BOOLEAN DEFAULT FALSE NOT NULL,
    reversed_reason TEXT,
    reversed_at TIMESTAMPTZ,
    reversed_by UUID REFERENCES auth.users(id)
);

-- 6. Transactions: Quality Returns (ONLY for Printing Line Issues)
CREATE TYPE quality_return_status_enum AS ENUM ('Draft', 'Submitted', 'Approved', 'Correction Required');

CREATE TABLE IF NOT EXISTS public.quality_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_number VARCHAR(100) UNIQUE NOT NULL,
    return_date DATE NOT NULL,
    job_id UUID NOT NULL REFERENCES public.jobs(id),
    job_number VARCHAR(100) NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    printing_batch_card_number VARCHAR(100) NOT NULL,
    original_coating_batch_card_number VARCHAR(100) NOT NULL,
    item_id UUID NOT NULL REFERENCES public.items(id),
    item_code VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    sheet_size VARCHAR(100) NOT NULL,
    coating_combination VARCHAR(255) NOT NULL,
    side_configuration side_config_enum NOT NULL DEFAULT 'Single',
    printing_line_issue_quantity INT NOT NULL,
    previously_approved_returned_quantity INT NOT NULL DEFAULT 0,
    good_quantity INT NOT NULL CHECK (good_quantity >= 0),
    rejected_quantity INT NOT NULL CHECK (rejected_quantity >= 0),
    total_returned_quantity INT NOT NULL CHECK (total_returned_quantity > 0),
    ups_per_sheet INT CHECK (ups_per_sheet IS NULL OR ups_per_sheet > 0),
    good_ups INT,
    rejected_ups INT,
    total_ups INT,
    remarks TEXT,
    status quality_return_status_enum DEFAULT 'Draft' NOT NULL,
    submitted_by UUID REFERENCES auth.users(id),
    submitted_by_name VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    approved_by_name VARCHAR(255),
    approved_at TIMESTAMPTZ,
    correction_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_total_return CHECK (total_returned_quantity = good_quantity + rejected_quantity)
);

-- 7. Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    record_reference VARCHAR(100) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Indexes for Instant Lookups & Reconciliation
CREATE INDEX IF NOT EXISTS idx_coating_receipts_batch ON public.coating_receipts(coating_batch_card_number);
CREATE INDEX IF NOT EXISTS idx_coating_receipts_item ON public.coating_receipts(item_code);
CREATE INDEX IF NOT EXISTS idx_coating_receipts_job ON public.coating_receipts(job_number);

CREATE INDEX IF NOT EXISTS idx_factory_issues_coating_batch ON public.factory_issues(coating_batch_card_number);
CREATE INDEX IF NOT EXISTS idx_factory_issues_printing_batch ON public.factory_issues(printing_batch_card_number);
CREATE INDEX IF NOT EXISTS idx_factory_issues_type ON public.factory_issues(issue_type);

CREATE INDEX IF NOT EXISTS idx_quality_returns_pbatch ON public.quality_returns(printing_batch_card_number);
CREATE INDEX IF NOT EXISTS idx_quality_returns_status ON public.quality_returns(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(created_at DESC);

-- 9. Row Level Security (RLS) Setup
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coating_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factory_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get authenticated user role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role_enum AS $$
    SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Master data policies: All authenticated can read; only Administrator can modify
CREATE POLICY "Allow read master data for all active users"
ON public.jobs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin manage jobs"
ON public.jobs FOR ALL TO authenticated
USING (public.get_auth_role() = 'Administrator')
WITH CHECK (public.get_auth_role() = 'Administrator');

-- Quality Return policies:
CREATE POLICY "Quality Dept can view submissions and create draft"
ON public.quality_returns FOR SELECT TO authenticated USING (true);

CREATE POLICY "Quality Dept can insert"
ON public.quality_returns FOR INSERT TO authenticated
WITH CHECK (public.get_auth_role() IN ('Administrator', 'Quality Department'));

CREATE POLICY "Admin can update approval or Quality can update drafts"
ON public.quality_returns FOR UPDATE TO authenticated
USING (
    public.get_auth_role() = 'Administrator' OR 
    (public.get_auth_role() = 'Quality Department' AND status IN ('Draft', 'Correction Required'))
);

-- 10. Atomic Database Function: Approve Quality Return
CREATE OR REPLACE FUNCTION public.approve_quality_return(
    p_return_id UUID,
    p_approver_id UUID,
    p_approver_name VARCHAR(255)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_qr RECORD;
    v_issued_qty INT;
    v_approved_qty INT;
    v_pending_qty INT;
BEGIN
    -- Lock record for update to prevent concurrent double-approval
    SELECT * INTO v_qr FROM public.quality_returns WHERE id = p_return_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quality return record not found';
    END IF;

    IF v_qr.status = 'Approved' THEN
        RAISE EXCEPTION 'Record is already approved';
    END IF;

    IF v_qr.submitted_by = p_approver_id THEN
        RAISE EXCEPTION 'Quality users or originators cannot approve their own submissions';
    END IF;

    -- Verify remaining outstanding balance from Printing Line issue
    SELECT COALESCE(SUM(issue_quantity), 0) INTO v_issued_qty
    FROM public.factory_issues
    WHERE printing_batch_card_number = v_qr.printing_batch_card_number AND is_reversed = FALSE;

    SELECT COALESCE(SUM(total_returned_quantity), 0) INTO v_approved_qty
    FROM public.quality_returns
    WHERE printing_batch_card_number = v_qr.printing_batch_card_number 
      AND status = 'Approved' 
      AND id <> p_return_id;

    IF (v_approved_qty + v_qr.total_returned_quantity) > v_issued_qty THEN
        RAISE EXCEPTION 'Approval exceeds outstanding Printing WIP quantity';
    END IF;

    -- Mark approved atomically
    UPDATE public.quality_returns
    SET status = 'Approved',
        approved_by = p_approver_id,
        approved_by_name = p_approver_name,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_return_id;

    -- Log audit
    INSERT INTO public.audit_logs (user_id, user_name, user_role, action, module, record_reference, reason)
    VALUES (p_approver_id, p_approver_name, 'Administrator', 'APPROVE_QUALITY_RETURN', 'Quality Return', v_qr.return_number, 'Quality Return verified and approved into stock');

    RETURN jsonb_build_object('success', true, 'message', 'Quality return approved successfully');
END;
$$;

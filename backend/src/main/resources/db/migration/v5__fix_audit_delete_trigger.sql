-- Fix delete-grade 500: BEFORE DELETE trigger with RETURN NULL cancels the row deletion.
-- Recreate the audit delete trigger as AFTER DELETE so the grade row is removed first,
-- while still writing the audit entry via fn_audit_grade().

DROP TRIGGER IF EXISTS trg_audit_grade_delete ON grade;

CREATE TRIGGER trg_audit_grade_delete
    AFTER DELETE ON grade
    FOR EACH ROW
EXECUTE FUNCTION fn_audit_grade();

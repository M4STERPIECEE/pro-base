CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION fn_hash_app_user_password()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $func$
BEGIN
    IF NEW.password !~ '^\$2[aby]\$[0-9]{2}\$.*' THEN
        NEW.password := crypt(NEW.password, gen_salt('bf', 10));
    END IF;
    RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_hash_app_user_password ON app_user;

CREATE TRIGGER trg_hash_app_user_password
    BEFORE INSERT OR UPDATE OF password ON app_user
    FOR EACH ROW
EXECUTE FUNCTION fn_hash_app_user_password();

UPDATE app_user
SET password = crypt(password, gen_salt('bf', 10))
WHERE password !~ '^\$2[aby]\$[0-9]{2}\$.*';

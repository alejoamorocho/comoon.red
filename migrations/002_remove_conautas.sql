-- Migration 002: Remove conautas table
-- The conauta role has been removed. Visitors browse, share, and buy without needing an account.

DROP TABLE IF EXISTS conautas;
DROP INDEX IF EXISTS idx_conautas_user_id;

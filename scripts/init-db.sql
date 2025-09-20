-- ASTRAL CORE V2 Database Initialization
-- Creates necessary extensions and initial schema

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create application user (for production)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'astralcore_app') THEN
        CREATE ROLE astralcore_app WITH LOGIN PASSWORD 'astralcore_app_password';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE astralcore TO astralcore_app;
GRANT USAGE ON SCHEMA public TO astralcore_app;
GRANT CREATE ON SCHEMA public TO astralcore_app;

-- Create audit log table for HIPAA compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create index on audit log for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- Function to automatically audit changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        operation,
        old_values,
        new_values,
        user_id,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
        COALESCE(current_setting('app.current_user_id', true), 'system'),
        NOW()
    );
    
    RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Create session store table for better session management
CREATE TABLE IF NOT EXISTS user_sessions (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (sid)
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_expire ON user_sessions(expire);

-- Performance monitoring table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time INTEGER NOT NULL, -- in milliseconds
    status_code INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255),
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint ON performance_metrics(endpoint);

-- Crisis metrics for monitoring
CREATE TABLE IF NOT EXISTS crisis_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_sessions INTEGER DEFAULT 0,
    emergency_escalations INTEGER DEFAULT 0,
    volunteer_responses INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 0, -- in seconds
    peak_concurrent_users INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crisis_metrics_date ON crisis_metrics(date);

-- Function to update crisis metrics
CREATE OR REPLACE FUNCTION update_crisis_metrics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO crisis_metrics (date, total_sessions)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (date)
    DO UPDATE SET 
        total_sessions = crisis_metrics.total_sessions + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'status', 'healthy',
        'timestamp', NOW(),
        'database_version', version(),
        'active_connections', (
            SELECT count(*) 
            FROM pg_stat_activity 
            WHERE state = 'active'
        ),
        'database_size', pg_size_pretty(pg_database_size(current_database()))
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to app user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO astralcore_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO astralcore_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO astralcore_app;

-- Set default permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO astralcore_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO astralcore_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO astralcore_app;

-- Create database info view
CREATE OR REPLACE VIEW database_info AS
SELECT 
    'ASTRAL CORE V2' as application,
    version() as postgres_version,
    current_database() as database_name,
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    (SELECT count(*) FROM pg_stat_activity) as total_connections,
    NOW() as initialized_at;

COMMENT ON VIEW database_info IS 'Database information for monitoring and health checks';
-- Database Schema for HR Management Reporting Microservice
-- Supabase PostgreSQL Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('administrator', 'hr_employee');
CREATE TYPE metric_type AS ENUM ('engagement', 'skill_progress', 'compliance', 'performance', 'course_completion');
CREATE TYPE recommendation_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_status AS ENUM ('generated', 'processing', 'failed');

-- Organizations dimension table
CREATE TABLE dim_organization (
    org_id VARCHAR(50) PRIMARY KEY,
    org_name VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams dimension table
CREATE TABLE dim_team (
    team_id VARCHAR(50) PRIMARY KEY,
    team_name VARCHAR(200) NOT NULL,
    org_id VARCHAR(50) NOT NULL REFERENCES dim_organization(org_id),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills dimension table
CREATE TABLE dim_skill (
    skill_id VARCHAR(50) PRIMARY KEY,
    skill_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    taxonomy_version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time dimension table
CREATE TABLE dim_time (
    time_key DATE PRIMARY KEY,
    year INT NOT NULL,
    quarter INT NOT NULL,
    month INT NOT NULL,
    week INT NOT NULL,
    day_of_week INT NOT NULL,
    is_weekend BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facts table for metrics
CREATE TABLE fact_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id VARCHAR(50) NOT NULL REFERENCES dim_organization(org_id),
    team_id VARCHAR(50) REFERENCES dim_team(team_id),
    metric_type metric_type NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    time_key DATE NOT NULL REFERENCES dim_time(time_key),
    source_system VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status report_status DEFAULT 'generated',
    file_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report artifacts table
CREATE TABLE report_artifacts (
    artifact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(report_id) ON DELETE CASCADE,
    format VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI recommendations table
CREATE TABLE ai_recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(report_id) ON DELETE CASCADE,
    data_point VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    status recommendation_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by VARCHAR(50),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE
);

-- Data pull log table
CREATE TABLE data_pull_log (
    pull_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_system VARCHAR(50) NOT NULL,
    records_processed INT DEFAULT 0,
    records_saved INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- User sessions table (for caching)
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL,
    role user_role NOT NULL,
    organization_id VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_fact_metrics_org_time ON fact_metrics(org_id, time_key);
CREATE INDEX idx_fact_metrics_type ON fact_metrics(metric_type);
CREATE INDEX idx_fact_metrics_team ON fact_metrics(team_id);
CREATE INDEX idx_fact_metrics_source ON fact_metrics(source_system);
CREATE INDEX idx_fact_metrics_created ON fact_metrics(created_at);

CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_generated ON reports(generated_at);
CREATE INDEX idx_reports_status ON reports(status);

CREATE INDEX idx_ai_recommendations_report ON ai_recommendations(report_id);
CREATE INDEX idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX idx_ai_recommendations_created ON ai_recommendations(created_at);

CREATE INDEX idx_data_pull_log_source ON data_pull_log(source_system);
CREATE INDEX idx_data_pull_log_started ON data_pull_log(started_at);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Create partitions for fact_metrics by time
CREATE TABLE fact_metrics_2024 PARTITION OF fact_metrics
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE fact_metrics_2025 PARTITION OF fact_metrics
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dim_organization_updated_at 
    BEFORE UPDATE ON dim_organization 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_team_updated_at 
    BEFORE UPDATE ON dim_team 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_skill_updated_at 
    BEFORE UPDATE ON dim_skill 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to populate time dimension
CREATE OR REPLACE FUNCTION populate_time_dimension(start_date DATE, end_date DATE)
RETURNS VOID AS $$
DECLARE
    current_date DATE := start_date;
BEGIN
    WHILE current_date <= end_date LOOP
        INSERT INTO dim_time (
            time_key,
            year,
            quarter,
            month,
            week,
            day_of_week,
            is_weekend
        ) VALUES (
            current_date,
            EXTRACT(YEAR FROM current_date),
            EXTRACT(QUARTER FROM current_date),
            EXTRACT(MONTH FROM current_date),
            EXTRACT(WEEK FROM current_date),
            EXTRACT(DOW FROM current_date),
            EXTRACT(DOW FROM current_date) IN (0, 6)
        ) ON CONFLICT (time_key) DO NOTHING;
        
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS VOID AS $$
BEGIN
    -- Delete expired user sessions
    DELETE FROM user_sessions WHERE expires_at < NOW();
    
    -- Delete old data pull logs (keep last 30 days)
    DELETE FROM data_pull_log WHERE started_at < NOW() - INTERVAL '30 days';
    
    -- Delete old reports (keep last 5 years)
    DELETE FROM reports WHERE created_at < NOW() - INTERVAL '5 years';
END;
$$ LANGUAGE plpgsql;

-- Create function to get organization metrics
CREATE OR REPLACE FUNCTION get_organization_metrics(
    p_org_id VARCHAR(50),
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    metric_type metric_type,
    average_value DECIMAL(10,2),
    total_records BIGINT,
    min_value DECIMAL(10,2),
    max_value DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fm.metric_type,
        AVG(fm.value)::DECIMAL(10,2) as average_value,
        COUNT(*) as total_records,
        MIN(fm.value) as min_value,
        MAX(fm.value) as max_value
    FROM fact_metrics fm
    WHERE fm.org_id = p_org_id
        AND fm.time_key >= p_start_date
        AND fm.time_key <= p_end_date
    GROUP BY fm.metric_type
    ORDER BY fm.metric_type;
END;
$$ LANGUAGE plpgsql;

-- Create function to get cross-organizational metrics
CREATE OR REPLACE FUNCTION get_cross_org_metrics(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    org_id VARCHAR(50),
    org_name VARCHAR(200),
    metric_type metric_type,
    average_value DECIMAL(10,2),
    total_records BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        do.org_id,
        do.org_name,
        fm.metric_type,
        AVG(fm.value)::DECIMAL(10,2) as average_value,
        COUNT(*) as total_records
    FROM fact_metrics fm
    JOIN dim_organization do ON fm.org_id = do.org_id
    WHERE fm.time_key >= p_start_date
        AND fm.time_key <= p_end_date
    GROUP BY do.org_id, do.org_name, fm.metric_type
    ORDER BY do.org_name, fm.metric_type;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO dim_organization (org_id, org_name) VALUES 
('org-1', 'Acme Corporation'),
('org-2', 'TechStart Inc'),
('org-3', 'Global Solutions Ltd');

INSERT INTO dim_team (team_id, team_name, org_id, department) VALUES 
('team-1', 'Engineering', 'org-1', 'Technology'),
('team-2', 'Marketing', 'org-1', 'Business'),
('team-3', 'Development', 'org-2', 'Technology'),
('team-4', 'Sales', 'org-2', 'Business'),
('team-5', 'Operations', 'org-3', 'Administration');

INSERT INTO dim_skill (skill_id, skill_name, category) VALUES 
('skill-1', 'JavaScript', 'Technical'),
('skill-2', 'Python', 'Technical'),
('skill-3', 'Communication', 'Interpersonal'),
('skill-4', 'Leadership', 'Management'),
('skill-5', 'Project Management', 'Management');

-- Populate time dimension for the last year
SELECT populate_time_dimension(
    CURRENT_DATE - INTERVAL '1 year',
    CURRENT_DATE
);

-- Create views for common queries
CREATE VIEW v_organization_performance AS
SELECT 
    do.org_id,
    do.org_name,
    fm.metric_type,
    AVG(fm.value) as avg_value,
    COUNT(*) as record_count,
    MIN(fm.value) as min_value,
    MAX(fm.value) as max_value
FROM fact_metrics fm
JOIN dim_organization do ON fm.org_id = do.org_id
GROUP BY do.org_id, do.org_name, fm.metric_type;

CREATE VIEW v_ai_recommendation_stats AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (approved_at - created_at))/3600) as avg_approval_hours
FROM ai_recommendations
GROUP BY status;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hr_reporting_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO hr_reporting_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO hr_reporting_user;
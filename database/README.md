# HR Management Reporting Database Schema
## educoreAI Internal Analytics Platform

### 🗄️ Complete Database Package

This package contains the complete PostgreSQL database schema for the HR & Management Reporting microservice, optimized for Supabase.

## 📦 Package Contents

### Database Schema Files
- **Complete Schema** - All tables, indexes, functions, and views
- **Sample Data** - Test data for development and testing
- **Migration Scripts** - Database setup and migration utilities
- **Performance Optimization** - Indexes and query optimization
- **Data Retention** - Automated data lifecycle management

### Key Features
✅ **Star Schema Design** - Optimized for analytical queries  
✅ **Time Partitioning** - Efficient handling of large datasets  
✅ **Performance Indexes** - Fast query execution  
✅ **Data Retention** - Automated cleanup and archiving  
✅ **Sample Data** - Ready-to-use test data  
✅ **Functions & Views** - Pre-built analytical functions  
✅ **Triggers** - Automated data management  

## 🛠️ Technology Stack

- **Database:** PostgreSQL 15+
- **Platform:** Supabase
- **Extensions:** uuid-ossp, pg_trgm
- **Partitioning:** Time-based partitioning
- **Indexing:** B-tree, covering indexes
- **Functions:** PL/pgSQL functions
- **Views:** Materialized views for performance

## 🚀 Quick Start

### Prerequisites
- Supabase account
- PostgreSQL 15+ (for local development)
- Database admin access

### Installation
```bash
# Connect to your Supabase database
psql -h your-supabase-host -U postgres -d postgres

# Run the schema
\i schema.sql

# Run sample data (optional)
\i sample-data.sql
```

### Supabase Setup
1. Create a new Supabase project
2. Run the schema.sql file in the SQL editor
3. Configure environment variables
4. Set up Row Level Security (RLS) policies

## 🏗️ Database Architecture

### Star Schema Design
```
fact_metrics (Fact Table)
├── dim_organization (Organization dimension)
├── dim_team (Team dimension)
├── dim_skill (Skill dimension)
└── dim_time (Time dimension)
```

### Core Tables
- **fact_metrics** - Main metrics data with partitioning
- **dim_organization** - Organization information
- **dim_team** - Team and department data
- **dim_skill** - Skill taxonomy and categories
- **dim_time** - Time dimension for analytics
- **reports** - Generated reports metadata
- **ai_recommendations** - AI insights and recommendations
- **data_pull_log** - Data ingestion tracking

## 📊 Data Model

### Fact Table (fact_metrics)
```sql
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
```

### Dimension Tables
- **dim_organization** - Client organizations
- **dim_team** - Teams within organizations
- **dim_skill** - Skill taxonomy and categories
- **dim_time** - Time dimension for analytics

### Operational Tables
- **reports** - Report generation metadata
- **report_artifacts** - Report files and exports
- **ai_recommendations** - AI insights storage
- **data_pull_log** - Data ingestion tracking
- **user_sessions** - User session management

## 🔍 Performance Optimization

### Indexing Strategy
```sql
-- Primary indexes for fast queries
CREATE INDEX idx_fact_metrics_org_time ON fact_metrics(org_id, time_key);
CREATE INDEX idx_fact_metrics_type ON fact_metrics(metric_type);
CREATE INDEX idx_fact_metrics_team ON fact_metrics(team_id);

-- Covering indexes for common queries
CREATE INDEX idx_fact_metrics_covering ON fact_metrics(org_id, time_key, metric_type) 
INCLUDE (value, source_system);
```

### Partitioning
```sql
-- Time-based partitioning for fact_metrics
CREATE TABLE fact_metrics_2024 PARTITION OF fact_metrics
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE fact_metrics_2025 PARTITION OF fact_metrics
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### Query Optimization
- **Partition Pruning** - Automatic partition elimination
- **Covering Indexes** - Avoid table lookups
- **Materialized Views** - Pre-computed aggregations
- **Function-based Indexes** - Optimized function calls

## 🔄 Data Lifecycle Management

### Retention Policies
```sql
-- Automated data cleanup function
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
```

### Data Retention Schedule
- **Cache Data** - 30 days in Redis
- **Operational Data** - 5 years in PostgreSQL
- **Audit Logs** - 7 years for compliance
- **Archived Data** - Permanent storage

## 📈 Analytical Functions

### Organization Metrics Function
```sql
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
```

### Cross-Organizational Metrics Function
```sql
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
```

## 🔐 Security & Access Control

### Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE fact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for role-based access
CREATE POLICY "Administrators can access all data" ON fact_metrics
FOR ALL TO administrator_role USING (true);

CREATE POLICY "HR employees can access their organization data" ON fact_metrics
FOR ALL TO hr_employee_role USING (org_id = current_setting('app.current_org_id'));
```

### Data Privacy
- **PII Filtering** - Personal data excluded from storage
- **Aggregated Data** - Only aggregated metrics stored
- **Access Logging** - All data access logged
- **Encryption** - Data encrypted at rest and in transit

## 📊 Pre-built Views

### Organization Performance View
```sql
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
```

### AI Recommendation Statistics View
```sql
CREATE VIEW v_ai_recommendation_stats AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (approved_at - created_at))/3600) as avg_approval_hours
FROM ai_recommendations
GROUP BY status;
```

## 🧪 Sample Data

### Test Organizations
```sql
INSERT INTO dim_organization (org_id, org_name) VALUES 
('org-1', 'Acme Corporation'),
('org-2', 'TechStart Inc'),
('org-3', 'Global Solutions Ltd');
```

### Test Teams
```sql
INSERT INTO dim_team (team_id, team_name, org_id, department) VALUES 
('team-1', 'Engineering', 'org-1', 'Technology'),
('team-2', 'Marketing', 'org-1', 'Business'),
('team-3', 'Development', 'org-2', 'Technology');
```

### Test Skills
```sql
INSERT INTO dim_skill (skill_id, skill_name, category) VALUES 
('skill-1', 'JavaScript', 'Technical'),
('skill-2', 'Python', 'Technical'),
('skill-3', 'Communication', 'Interpersonal'),
('skill-4', 'Leadership', 'Management');
```

## 🔧 Maintenance & Monitoring

### Automated Maintenance
```sql
-- Create maintenance function
CREATE OR REPLACE FUNCTION run_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Update statistics
    ANALYZE fact_metrics;
    ANALYZE dim_organization;
    ANALYZE dim_team;
    
    -- Clean up expired data
    PERFORM cleanup_expired_data();
    
    -- Update materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_organization_performance;
END;
$$ LANGUAGE plpgsql;
```

### Performance Monitoring
- **Query Performance** - Monitor slow queries
- **Index Usage** - Track index effectiveness
- **Storage Usage** - Monitor disk space
- **Connection Pooling** - Optimize connections

## 📋 Migration Scripts

### Database Setup
```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('administrator', 'hr_employee');
CREATE TYPE metric_type AS ENUM ('engagement', 'skill_progress', 'compliance', 'performance', 'course_completion');
```

### Data Migration
```sql
-- Migrate existing data
INSERT INTO fact_metrics (org_id, metric_type, value, time_key, source_system)
SELECT 
    organization_id,
    metric_type,
    value,
    date_trunc('day', created_at)::date,
    'migration'
FROM legacy_metrics_table;
```

## 🎯 Performance Benchmarks

### Query Performance Targets
- **Dashboard Queries** - < 100ms response time
- **Report Generation** - < 2 seconds for complex reports
- **Data Ingestion** - > 1000 records/second
- **Concurrent Users** - Support 100+ simultaneous users

### Storage Optimization
- **Compression** - Automatic compression for old data
- **Partitioning** - Monthly partitions for fact tables
- **Indexing** - Optimized indexes for common queries
- **Archiving** - Automatic archiving of old data

## 🔄 Backup & Recovery

### Backup Strategy
- **Daily Backups** - Full database backups
- **Point-in-Time Recovery** - WAL-based recovery
- **Cross-Region Replication** - Disaster recovery
- **Backup Testing** - Regular restore testing

### Recovery Procedures
- **RTO** - Recovery Time Objective: 4 hours
- **RPO** - Recovery Point Objective: 1 hour
- **Testing** - Monthly disaster recovery tests
- **Documentation** - Detailed recovery procedures

---

**This database package provides a complete, production-ready PostgreSQL schema optimized for the HR & Management Reporting microservice!** 🗄️

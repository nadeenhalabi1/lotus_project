# Database (Cache) Configuration

This folder contains all Redis cache-related configuration and utilities for the Management Reporting microservice.

## Redis Configuration

The system uses Redis as the primary data storage (cache layer). All data is stored in Redis with a 60-day rolling retention period.

## Key Naming Convention

```
mr:{service}:{identifier}:{yyyymmdd}

Examples:
- mr:dir:org123:20240115
- mr:cb:course456:20240115
- mr:assess:skill789:20240115
- mr:cs:content101:20240115
- mr:la:monthly:20240115
```

## Configuration

Redis connection is configured via environment variables:
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (if required)
- `REDIS_TLS` - Enable TLS (true/false)

## Data Structure

Each cache entry contains:
```json
{
  "data": {
    // Actual data from microservice
  },
  "metadata": {
    "collected_at": "ISO 8601 timestamp",
    "source": "microservice name",
    "schema_version": "1.0",
    "is_suspect": false
  }
}
```

## TTL (Time-To-Live)

- Default TTL: 60 days (5184000 seconds)
- Automatic expiration handled by Redis
- Cleanup job runs daily at 02:00 AM

## Local Development

For local development, use Docker to run Redis:

```bash
docker run -d -p 6379:6379 redis:latest
```

Or use Redis Cloud for cloud-managed Redis.


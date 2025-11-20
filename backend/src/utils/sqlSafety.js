/**
 * SQL Safety validation utilities
 * Ensures that only safe, read-only SELECT queries are executed
 */

/**
 * Validates that a SQL query is safe to execute (SELECT-only, no destructive operations)
 * 
 * @param {string} sql - The SQL query to validate
 * @returns {{valid: boolean, error: string | null}}
 */
export function validateSqlSafety(sql) {
  if (!sql || typeof sql !== 'string') {
    return { valid: false, error: 'SQL query must be a non-empty string' };
  }

  const trimmed = sql.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'SQL query cannot be empty' };
  }

  // Check that query starts with SELECT (case-insensitive)
  const selectPattern = /^\s*select\b/i;
  if (!selectPattern.test(trimmed)) {
    return { valid: false, error: 'Only SELECT queries are allowed' };
  }

  // List of dangerous keywords that should not appear in the query
  const dangerousKeywords = [
    'insert', 'update', 'delete', 'drop', 'alter', 'truncate',
    'create', 'grant', 'revoke', 'execute', 'call', 'prepare',
    'deallocate', 'refresh materialized view', 'reindex', 'vacuum',
    'lock', 'set', 'show', 'comment', 'analyze'
  ];

  const upperSql = trimmed.toUpperCase();

  for (const keyword of dangerousKeywords) {
    const keywordPattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (keywordPattern.test(trimmed)) {
      return { valid: false, error: `Disallowed keyword found: ${keyword}. Only SELECT queries are allowed.` };
    }
  }

  // Check for multiple statements (allow at most one trailing semicolon)
  // Remove trailing semicolon and whitespace, then check if there are any remaining semicolons
  const withoutTrailingSemicolon = trimmed.replace(/;\s*$/, '');
  if (withoutTrailingSemicolon.includes(';')) {
    return { valid: false, error: 'Multiple statements are not allowed. Only single SELECT queries are permitted.' };
  }

  return { valid: true, error: null };
}

/**
 * Adds a LIMIT clause to a query if it doesn't already have one
 * This prevents huge result sets that could cause performance issues
 * 
 * @param {string} sql - The SQL query
 * @param {number} maxRows - Maximum number of rows to return (default: 5000)
 * @returns {string} - The SQL query with LIMIT added if needed
 */
export function addLimitIfMissing(sql, maxRows = 5000) {
  if (!sql || typeof sql !== 'string') {
    return sql;
  }

  const trimmed = sql.trim();
  
  // Check if query already has a LIMIT clause (case-insensitive)
  const limitPattern = /\blimit\s+\d+/i;
  if (limitPattern.test(trimmed)) {
    // Query already has LIMIT, return as-is
    return trimmed;
  }

  // Remove trailing semicolon if present
  const withoutSemicolon = trimmed.replace(/;\s*$/, '');
  
  // Add LIMIT clause
  return `${withoutSemicolon} LIMIT ${maxRows}`;
}


// db.ts - thin PostgreSQL client (pg-promise style). `pool` is injected by the runtime; nothing else to read.
declare const pool: any;
export const db = {
  one: (sql: string, params?: unknown[]) => pool.one(sql, params),       // 1 row or null
  none: (sql: string, params?: unknown[]) => pool.none(sql, params),     // no result
  result: (sql: string, params?: unknown[]) => pool.result(sql, params), // { rowCount, rows }
  tx: <T>(fn: (t: typeof db) => Promise<T>) => pool.tx(fn),               // BEGIN ... COMMIT
};

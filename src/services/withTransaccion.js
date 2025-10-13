const db = require('../config/db');


async function withTransaction(work) {
  const client = await db.getClient(); // usa el cliente del pool
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    client.release();
  }
}

module.exports ={
    withTransaction
}
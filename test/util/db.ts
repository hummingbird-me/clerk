import Knex from 'knex';

const pool = Knex({
  client: 'pg',
  connection: 'psql://localhost/clerk_test',
  pool: { min: 0, max: 10 }
});

export default async function(fn: (transaction: Knex.Transaction) => Promise<any>): Promise<any> {
  return await pool.transaction(async (transaction) => {
    return fn(transaction).finally(() => transaction.raw('ROLLBACK'));
  });
}

import Knex from 'knex';
import nanoid from 'nanoid';

// Scoped by fileId so we need very little entropy
const NANOID_LENGTH = 10;

export type Reference = {
  file_id: string;
  key: string;
  service_id: string;
  released_at?: Date;
};

/**
 * Create a new reference
 * @param  db the database connection
 * @param  file_id the File ID
 * @param  service_id a string identifying the service which checked out this connection
 * @return the reference info
 */
export async function create(
  db: Knex,
  file_id: string,
  service_id: string,
  expires_at?: Date
): Promise<Reference> {
  const key = nanoid(NANOID_LENGTH);
  const [reference] = await db('file_references').insert({
    file_id,
    key,
    service_id,
    released_at: expires_at
  }).returning('*');

  return reference;
}

/**
 * Find an existing reference to a file
 * @param  db the database connection
 * @param  file_id the file ID
 * @param  key the locally-unique (per file) key of this reference
 * @return the reference info
 */
export async function find(db: Knex, file_id: string, key: string): Promise<Reference> {
  return db('file_references').where({ file_id, key }).first();
}

/**
 * Release an existing reference to a file
 * @param  db the database connection
 * @param  file_id the file ID
 * @param  key the locally-unique key of the reference to release
 */
export async function release(db: Knex, file_id: string, key: string): Promise<void> {
  return db('file_references').where({ file_id, key }).delete();
}

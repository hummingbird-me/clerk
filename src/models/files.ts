import Knex from 'knex';
import nanoid from 'nanoid';

const NANOID_LENGTH = 50;

export class NotFoundError extends Error {}

export type File = {
  id: string,
  mime_type: string,
  size: number,
  metadata: any
};

/**
 * Cast a database row into a File object
 * @param  obj database row
 * @return the File object
 */
function castFile(obj: {
  id: string,
  mime_type: string,
  size: number | string,
  metadata: any
}): File {
  if (typeof obj.size === 'string') obj.size = parseInt(obj.size, 10);

  return obj as File;
}

/**
 * Look up a file's information based on the ID
 * @param  db the database connection
 * @param  id the File identifier
 * @return the file information
 */
export async function find(db: Knex, id: string): Promise<File> {
  const file = await db('files').where({ id }).first();

  return castFile(file);
}

/**
 * Create a new file
 * @param  db the database connection
 * @param  mime_type the MIME type of the file
 * @param  size the number of bytes in the file
 * @return the file ID
 */
export async function create(db: Knex, mime_type: string, size: number): Promise<string> {
  const id = nanoid(NANOID_LENGTH);

  await db('files').insert({
    id,
    mime_type,
    size,
    metadata: {
      createdAt: Date.now()
    }
  });

  return id;
}

/**
 * Adds metadata to a File
 * @param  db the database connection
 * @param  id the file ID
 * @param  metadata a metadata object to merge into the File's existing metadata
 * @return the file information after modification
 */
export async function updateMetadata(db: Knex, id: string, metadata: {}): Promise<File> {
  const [file] = await db('files').where({ id }).update({
    metadata: db.raw('metadata || ?', JSON.stringify(metadata))
  }).returning('*');

  return castFile(file);
}

/**
 * Check if a file is ready to be garbage-collected yet
 * @param  db the database connection
 * @param  file_id the file ID
 * @return whether the file is ready to be collected
 */
export async function isGarbage(db: Knex, file_id: string) {
  // Since we only need to check if there is at least one reference, we `LIMIT 1`
  const { count: living } = await db('file_references').where({ file_id })
                                                       .where((q) => q
                                                         .whereNull('released_at')
                                                         .orWhereNot(db.raw('released_at < NOW()'))
                                                       ).first().count();

  return living === '0';
}

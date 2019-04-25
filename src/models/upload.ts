import Knex from 'knex';
import nanoid from 'nanoid';
import { promises as fs, createWriteStream } from 'fs';
import { finished as _finished } from 'stream';
import { promisify } from 'util';
import { tmpdir } from 'os';
import * as path from 'path';
import ClerkStore from '../stores/base';

const finished = promisify(_finished);

const NANOID_LENGTH = 50;

export class NotFoundError extends Error {}

export class Upload {
  id: string;
  mime_type: string;
  size: number;
  metadata: any;

  // Dependencies
  store: ClerkStore;

  constructor(options: {
    id: string,
    mime_type: string,
    size: number,
    metadata: any
  }, store: ClerkStore) {
    this.store = store;
    Object.assign(this, options);
  }

  /**
   * @return The file name for a local temp copy of this upload
   */
  private get tmpFileName(): string {
    return path.join(tmpdir(), this.id);
  }

  /**
   * Get a local copy of the file to work with
   * @return A promise which resolves to the local copy of the file
   */
  get file(): Promise<string> {
    return (async () => {
      try {
        await fs.access(this.tmpFileName);
      } catch (err) {
        const tmpFile = createWriteStream(this.tmpFileName, { flags: 'wx' });
        await finished(this.store.downloadOriginal(this.id).pipe(tmpFile));
      }
      return this.tmpFileName;
    })();
  }

  /**
   * Look up an Upload in the database
   * @param  db the database connection
   * @param  store the ClerkStore to find this file in
   * @param  id the Upload ID
   * @return a promise which resolves to the Upload for the record
   */
  static async find(db: Knex, store: ClerkStore, id: string): Promise<Upload> {
    const file = await db('files').where({ id }).first();

    return new Upload(file, store);
  }

  /**
   * Create a new Upload
   * @param  db the database connection
   * @param  mime_type the MIME type of the file
   * @param  size the number of bytes in the file
   * @return the file ID
   */
  static async create(db: Knex, mime_type: string, size: number): Promise<string> {
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
   * Add metadata to a File
   * @param  db the database connection
   * @param  id the file ID
   * @param  metadata a metadata object to merge into the File's existing metadata
   * @return the file information after modification
   */
  async updateMetadata(db: Knex, id: string, metadata: {}): Promise<Upload> {
    const [file] = await db('files').where({ id }).update({
      metadata: db.raw('metadata || ?', JSON.stringify(metadata))
    }).returning('*');

    Object.assign(this, file);
    return this;
  }
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

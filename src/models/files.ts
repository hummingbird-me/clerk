import Knex from 'knex';
import nanoid from 'nanoid';

const NANOID_LENGTH = 70;

export class NotFoundError extends Error {}

export type File = {
  id: string,
  mime: string,
  metadata: {}
};

export async function getById(db: Knex, id: string): Promise<File> {
  return db('files').where({ id }).first();
}

export async function create(db: Knex): Promise<string> {
  const id = nanoid(NANOID_LENGTH);

  await db('files').insert({
    id: id,
    metadata: {
      createdAt: Date.now()
    }
  });

  return id;
}

export async function updateMetadata(db: Knex, id: string, metadata: {}) {
  await db('files').where({ id }).update({
    metadata: db.raw('metadata || ?', JSON.stringify(metadata))
  });
}

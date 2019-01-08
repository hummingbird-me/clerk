import { create as createFile } from '../models/files';
import Knex from 'knex';
import { S3 } from 'aws-sdk';
import { Config } from '../config';

export async function getUploadTicket (
  _parent: any,
  args: {
    type: string,
    size: number
  },
  context: {
    s3: S3,
    db: Knex,
    config: Config
  }
) {
  const prefix = context.config.s3.prefix;
  const id = await createFile(context.db);
  const key = prefix ? `${prefix}${id}` : id;

  return context.s3.createPresignedPost({
    Bucket: 'kitsu-files',
    Fields: {
      'Content-Type': args.type,
      key
    }
  });
}

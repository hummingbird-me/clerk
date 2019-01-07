import { Config as KnexConfig } from 'knex';
import { S3, SQS } from 'aws-sdk';

export type View = {
  // What name should be used for this view
  name: string;
  // Determines whether this view is calculated for a given type
  test: (file: File) => Boolean;
  // Generates a file for a given type
  generate: (file: File) => Promise<any>;
};

export type S3Config = S3.ClientConfiguration & { prefix?: string };
export type SQSConfig = SQS.ClientConfiguration & { QueueName: string };

export type Config = {
  db: KnexConfig,
  s3: S3Config,
  sqs: SQSConfig,
  views: Array<View>
};

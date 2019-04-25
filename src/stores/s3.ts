import { Readable } from 'stream';
import { S3, SQS } from 'aws-sdk';
import ClerkStore from './base';
import { SignedRequest } from '../models/signed-request';

type Config = {
  original: {
    client: S3.ClientConfiguration,
    bucket: string,
    queue: string
  },
  variant: {
    client: S3.ClientConfiguration,
    bucket: string
  }
};

type S3Event = {
  eventVersion: '2.1';
  eventSource: 'aws:s3';
  awsRegion: string;
  eventTime: string;
  eventName: string;
  userIdentity: { principalId: string };
  requestParameters: { sourceIPAddress: string };
  responseElements: { [key: string]: string };
  s3: {
    s3SchemaVersion: '1.0';
    configurationId: string;
    bucket: {
      name: string;
      ownerIdentity: {};
      arn: string;
    };
    object: {
      key: string;
      size: number;
      eTag: string;
      sequencer: string;
    }
  }
};

export default class S3Store implements ClerkStore {
  private config: Config;
  private sqs: { [key: string]: SQS } = {};
  private s3: { [key: string]: S3 } = {};

  constructor(config: Config) {
    this.config = config;

    this.sqs.original = new SQS(config.original.client);
    this.s3.original = new S3(config.original.client);
    this.s3.variant = new S3(config.variant.client);
  }

  presign(
    key: string,
    contentType: string
  ): Promise<SignedRequest> {
    // There doesn't seem to be a Promisified API for createPresignedPost in the AWS SDK, so we wrap
    // in a Promise ourselves.  When attempting to use util.promisify for this, the AWS SDK broke.
    return new Promise((resolve, reject) => {
      this.s3.original.createPresignedPost({
        Bucket: this.config.original.bucket,
        Fields: {
          'Content-Type': contentType,
          key
        }
      }, (err, data) => {
        if (err) return reject(err);

        // Build our signed request structure from the structure that S3 provides us
        resolve({
          url: data.url,
          method: 'POST',
          parameters: data.fields
        });
      });
    });
  }

  downloadOriginal(key: string): Readable {
    return this.s3.original.getObject({
      Key: key,
      Bucket: this.config.original.bucket
    }).createReadStream();
  }

  async uploadVariant(
    key: string,
    variant: string,
    contentType: string,
    data: Readable
  ): Promise<void> {
    await this.s3.variant.putObject({
      Key: `${key}/${variant}`,
      Bucket: this.config.variant.bucket,
      Body: data,
      ContentType: contentType
    });
  }

  async *uploads() {
    // Have the AWS SDK generate a queue url for the provided queue name
    const sqs = this.sqs.original;
    const { QueueUrl } = await sqs.getQueueUrl({
      QueueName: this.config.original.queue
    }).promise();

    // Use long polling to load messages from SQS
    while (true) {
      const { Messages: messages } = await sqs.receiveMessage({
        QueueUrl,
        WaitTimeSeconds: 3600,
        MaxNumberOfMessages: 10
      }).promise();

      // A single response may contain up to 10 messages (see MaxNumberOfMessages above), so we need
      // to iterate over each message contained in the response and process them separately
      for (const message of messages) {
        const body: { Records: S3Event[] } = JSON.parse(message.Body);
        // Each SQS message from S3 can contain multiple events, so we need a second loop to handle
        // that.  Yeah, it's kinda dumb.
        for (const event of body.Records) {
          yield event.s3.object.key;
        }
      }
    }
  }
}

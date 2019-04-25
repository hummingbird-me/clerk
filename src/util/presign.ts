import { S3 } from 'aws-sdk';

const s3 = new S3();

export function presign(obj: AWS.S3.PresignedPost.Params) {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(obj, (err, data) => {
      if (err) return reject(err);

      resolve(data);
    });
  });
}

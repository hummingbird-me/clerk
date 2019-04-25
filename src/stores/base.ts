import { Readable } from 'stream';
import { SignedRequest } from '../models/signed-request';

export default interface ClerkStore {
  /**
   * Create a presigned request
   * @param  name        The name of the file
   * @param  contentType The MIME type of the file to be uploaded
   * @param  size        The size of the file to be uploaded
   * @return             A promise which resolves to the presigned request information
   */
  presign(
    key: string,
    contentType: string,
    size: number
  ): Promise<SignedRequest>;

  /**
   * Get a download stream for a file
   * @param  key the filename to download the original for
   * @return     A readable stream of the file contents
   */
  downloadOriginal(key: string): Readable;

  /**
   * Upload a variant file to the provided variant store
   * @param  key         the filename
   * @param  variant     the variant you want to upload
   * @param  contentType the MIME type of the file you're uploading
   * @param  data        the data you're trying to upload
   * @return             a promise which resolves/rejects based on whether the upload was successful
   */
  uploadVariant(key: string, variant: string, contentType: string, data: Readable): Promise<void>;

  /**
   * Get a real time stream of uploaded files
   * @return an asynchronous iterator which lists the file names as they are uploaded
   */
  uploads(): AsyncIterableIterator<string>;
}

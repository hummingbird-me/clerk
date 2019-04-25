import { Upload } from '../../src/models/upload';
import DummyStore from '../util/store';
import conn from '../util/db';
import { expect } from 'chai';
import { promises as fs } from 'fs';

describe('Upload', () => {
  describe('.file', () => {
    describe('for the first call', () => {
      it('should download the file and return a Promise which resolves to the path', async () => {
        const upload = new Upload({
          id: '123',
          mime_type: 'application/octet-stream',
          size: 200,
          metadata: {}
        }, new DummyStore);

        const file = await upload.file;
        expect(file).to.be.a('string');
        await fs.access(file);
      });
    });

    describe('for later calls', () => {
      it('should return a Promise which resolves to the same path every time', async () => {
        const upload = new Upload({
          id: '123',
          mime_type: 'application/octet-stream',
          size: 200,
          metadata: {}
        }, new DummyStore);

        expect(await upload.file).to.equal(await upload.file);
      });
    });
  });
});

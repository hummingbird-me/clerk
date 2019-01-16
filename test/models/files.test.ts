import * as files from '../../src/models/files';
import * as references from '../../src/models/references';
import conn from '../util/db';
import { expect } from 'chai';

describe('Files.create', () => {
  it('should create a new row', async () => {
    return conn(async (db) => {
      await files.create(db, 'image/jpeg', '12345');
      const [ { count: filesCount } ] = await db('files').count();
      expect(filesCount).to.equal('1');
    });
  });

  it('should return the ID of the new row', async () => {
    return conn(async (db) => {
      const id = await files.create(db, 'image/png', '12345');
      expect(id).to.be.a('string');
    });
  });
});

describe('Files.find', () => {
  describe('for a file which exists', () => {
    it('should return a File object', async () => {
      return conn(async (db) => {
        const id = await files.create(db, 'image/png', '12345');
        const file = await files.find(db, id);
        expect(file).to.deep.include({
          id,
          mime_type: 'image/png',
          size: '12345'
        });
      });
    });
  });

  describe('for a file which does not exist', () => {
    it('should return null', async () => {
      return conn(async (db) => {
        const file = await files.find(db, 'missing');
        expect(file).to.be.undefined;
      });
    });
  });
});

describe('Files.updateMetadata', () => {
  it('should merge the new data into the file metadata', async () => {
    return conn(async (db) => {
      const id = await files.create(db, 'image/png', '12345');
      await files.updateMetadata(db, id, { foo: 'bar' });
      const file = await files.find(db, id);
      expect(file.metadata.foo).to.equal('bar');
    });
  });
});

describe('Files.isGarbage', () => {
  describe('for a file with a permanent reference', () => {
    it('should return false', async () => {
      return conn(async (db) => {
        const file = await files.create(db, 'image/png', '12345');
        await references.create(db, file, 'profile');
        expect(await files.isGarbage(db, file)).to.be.false;
      });
    });
  });

  describe('for a file with no permanent references', () => {
    describe('and an expired temporary reference', () => {
      it('should return true', async () => {
        return conn(async (db) => {
          const file = await files.create(db, 'image/png', '12345');
          await references.create(db, file, 'profile', new Date(2010, 1));
          expect(await files.isGarbage(db, file)).to.be.true;
        });
      });
    });

    describe('and a live temporary reference', () => {
      it('should return false', async () => {
        return conn(async (db) => {
          const file = await files.create(db, 'image/png', '12345');
          await references.create(db, file, 'profile', new Date(2040, 1));
          expect(await files.isGarbage(db, file)).to.be.false;
        });
      });
    });
  });
});

import ClerkStore from '../../src/stores/base';
import { Readable } from 'stream';

export default class DummyStore implements ClerkStore {
  downloadOriginal = jest.fn((_id: string) => {
    const stream = new Readable();
    stream._read = () => {};
    stream.push('TEST');
    return stream;
  });

  presign = jest.fn(async (key: string, contentType: string) => {
    return {
      method: 'POST',
      url: 'https://localhost/upload',
      headers: { 'Content-Type': contentType },
      query: { key: key }
    };
  });

  uploadVariant = jest.fn(async (..._args: any[]) => {});

  uploads = jest.fn(async function*(): AsyncIterableIterator<string> {
    yield 'foo';
    yield 'bar';
    yield 'baz';
  });
}

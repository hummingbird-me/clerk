import { readFile as _readFile } from 'fs';
import path from 'path';
import { IResolvers } from 'apollo-server';
import glob from 'glob';

export default async function(): Promise<IResolvers<any, any>> {
  const resolverFiles = glob.sync(`${__dirname}/*.js`);

  const resolvers = await Promise.all(resolverFiles.map(async(file): Promise<IResolvers<any, any>> => {
    if (file == __filename) return;

    const { name } = path.parse(file);
    const module = await import(file);

    if (module instanceof Function) return { [name]: module };
  }));

  return resolvers.reduce((acc, curr): IResolvers<any, any> => {
    return { ...acc, ...curr };
  }, {});
}

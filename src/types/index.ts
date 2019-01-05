import { readFileSync } from 'fs';
import glob from 'glob';

const files = glob.sync(`${__dirname}/*.js`);
const typeDefs: string[] = [];

for (const file of files) {
  if (file == __filename) continue;
  typeDefs.push(JSON.parse(readFileSync(file, 'utf8')));
}

export default typeDefs;

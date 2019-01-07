import API from './api';
import { Config } from './config';

export default async function Clerk (config: Config) {
  const { url } = await API(config);
  console.log(`🚀 Server ready at ${url}`);
}

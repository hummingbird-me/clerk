import _glob from 'glob';
import { promisify } from 'util';

export default promisify(_glob);

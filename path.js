import 'module-alias/register';
import { addAliases } from 'module-alias';

addAliases({
  '@env': `${__dirname}/path/to/env`,
});
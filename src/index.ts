import {program} from 'commander';
import list from './commands/list';
const main = () => {
  list(program);
  program.parse(process.argv);
};
main();
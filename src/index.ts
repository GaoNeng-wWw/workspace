import {program} from 'commander';
import list from './commands/list';
import analysis from './commands/analysis';
const main = async () => {
  list(program);
  await analysis(program);
  program.parse(process.argv);
};
main()
.then(()=>{});
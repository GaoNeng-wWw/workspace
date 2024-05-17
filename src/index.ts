import {program} from 'commander';
const main = async () => {
  const list = await import('./commands/list');
  list.default(program);
  program.parse(process.argv);
};
main()
.then(()=>{});
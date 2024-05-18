import { Command } from "commander";
import { existsSync } from "fs";
import { join, relative, resolve } from "path";
import { error } from "../log";
import { exit } from "process";
import { readProjects } from '@pnpm/filter-workspace-packages';


const findPnpmWorkspace = async (
  basePath: string,
  yamlPath: string
) => {
  if (!existsSync(yamlPath)){
    error('pnpm-workspace.yaml not exists');
    exit();
    return;
  }
  const {allProjects} = await readProjects(basePath, [], {
    engineStrict: true,
  });
  allProjects.forEach((project) => {
    if (project.manifest.name){
      console.log(project.manifest.name);
      console.log(' '.repeat(2),'∟', relative(process.cwd(), project.dir));
    }
  });
};

const listWorkspace = (
  path: string = '.',
) => {
  const resolvedPath = resolve(path);
  findPnpmWorkspace(resolvedPath, join(resolvedPath, 'pnpm-workspace.yaml'));
};

export default (program: Command) => {
  program.command('list [path]')
    .description('Scan all packages in the working directory')
    .action(listWorkspace);
};
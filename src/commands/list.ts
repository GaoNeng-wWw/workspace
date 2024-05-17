import { Command } from "commander";
import { existsSync } from "fs";
import { join, relative, resolve } from "path";
import { error } from "../log";
import { exit } from "process";
import { readProjects } from '@pnpm/filter-workspace-packages';
interface TreeNode {
  value: string
  children: TreeNode[]
}

// 循环构建子节点
const buildChildrenNode = (children: TreeNode[], nodeArray: string[]) => {
  for (const i in nodeArray) {
      const _i: number = Number(i);
      const node: TreeNode = {
          value: nodeArray[_i],
          children: []
      };
      if (_i != nodeArray.length) {
          node.children = [];
      }
      if (children.length == 0) {
          children.push(node);
      }
      let isExist = false;
      for (const j in children) {
          if (children[j].value == node.value) {
              if (_i != nodeArray.length - 1 && !children[j].children) {
                  children[j].children = [];
              }
              children = _i == nodeArray.length - 1 ? children : children[j].children;
              isExist = true;
              break;
          }
      }
      if (!isExist) {
          children.push(node);
          if (_i != nodeArray.length - 1 && !children[children.length - 1].children) {
              children[children.length - 1].children = [];
          }
          children = _i == nodeArray.length - 1 ? children : children[children.length - 1].children;
      }
  }
};
export const array2Tree = (list: string[]) => {
  const targetList: TreeNode[] = [];
  list.map(item => {
      const label = item;
      const nodeArray: string[] = label.split('\\').filter(str => str != '');
      // 递归
      const children: TreeNode[] = targetList;
      // 构建根节点
      if (children.length == 0) {
          const root: TreeNode = {
              value: nodeArray[0],
              children: []
          };
          if (nodeArray.length > 1) {
              root.children = [];
          }
          children.push(root);
          buildChildrenNode(children, nodeArray);
      } else {
          buildChildrenNode(children, nodeArray);
      }
  });
  return targetList;
};


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
  program.command('list [path]', 'List all packages in the path')
    .action(listWorkspace);
};
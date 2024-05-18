import {Command} from 'commander';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import {error, info} from '../log';
import { exit } from 'process';
import { PackageGraph, readProjects } from '@pnpm/filter-workspace-packages';
import {Project} from '@pnpm/types';
import {Edge, Graph, Node, toDot, attribute as _} from 'ts-graphviz';
import { toFile } from '@ts-graphviz/adapter';

export type Option = {
  excludes: string | undefined;
  includes: string | undefined;
}

const draw = (g: Graph, nodes: Map<string, Node>, relation: [string, string[]][]) => {
  for (const [path, dependencies] of relation){
    if (!nodes.has(path)){
      continue;
    }
    const node = nodes.get(path);
    g.addNode(node);
    for (const dep of dependencies){
      if (!nodes.has(dep)){
        continue;
      }
      const depNode = nodes.get(dep);
      const edge = new Edge([node, depNode], {
        [_.color]: '#1668DC',
        [_.dir]: 'forward',
      });
      g.addEdge(edge);
    }
  }
};

const sort = (graph: PackageGraph<Project>) => {
  const map = new Map<string, number>();
  for (const [path, {dependencies}] of Object.entries(graph)){
    map.set(path, 0);
    for (const dep of dependencies){
      if (map.has(dep)){
        map.set(dep, map.get(dep)+1);
      } else {
        map.set(dep, 0);
      }
    }
  }
  const newPath = Array.from(map.entries()).sort((a,b) => b[1] - a[1]);
  const g: [string, string[]][] = [];
  for (const [path] of newPath){
    const {dependencies} = graph[path] ?? {dependencies: []};
    g.push([path, dependencies]);
  }
  return g;
};

const patternName = (patterns: RegExp[], name: string) => patterns.some(pattern => pattern.test(name));
const createNode = (name: string, path:string, nodes: Map<string, Node>) => {
  const node = new Node(name, {
    [_.fontcolor]: '#ffffffcc',
    [_.fillcolor]: '#222',
    [_.shape]: 'box',
    [_.style]: 'filled'
  });
  nodes.set(path, node);
};

const getPatterns = (str: string, sep: string = ',') => str.split(sep).filter((v) => v.length > 0).map((v) => v.split(',')).flat();

export const analysisDependencies = async (
  path: string = '.',
  options:Option
) => {
  const {excludes='', includes=''} = options;
  const excludeArray = getPatterns(excludes);
  const includesArray = getPatterns(includes);
  const includesRegExp = includesArray.map((include) => new RegExp(include));
  const excludeRegExp = excludeArray.map((exclude) => new RegExp(exclude));
  const resolvePath = resolve(path);
  if (!existsSync(resolvePath)){
    error('pnpm-workspace.yaml not exists');
    exit();
  }
  const {allProjectsGraph} = await readProjects(resolvePath, [], {engineStrict: false});
  const g = new Graph('', {
    [_.bgcolor]: '#141414',
    [_.rankdir]: 'LR',
  });
  const nodes = new Map();
  const filtedGraph:PackageGraph<Project> = {};
  for (const [path, project] of Object.entries(allProjectsGraph)){
    const {package: {manifest: {name}}} = project;
    if (!name){
      continue;
    }
    if (excludeRegExp.length && patternName(excludeRegExp,name)){
      info(`Ignore ${name}`);
      continue;
    }
    if (includesRegExp.length && !patternName(includesRegExp, name)) {
      continue;
    }
    info(`find ${name}`);
    createNode(name, path, nodes);
    filtedGraph[path] = project;
  }
  const graph = sort(filtedGraph);
  draw(g, nodes, graph);
  g.attributes.graph.set(_.rank, 'same');
  const dot = toDot(g);
  await toFile(
    dot,
    join(resolvePath, 'dependiencies.svg'),
    {
      format: 'svg',
      layout: 'dot'
    }
  );
  info('Generate dependiencies success');
};
export default async (program: Command) => {
  program.command('analysis [path]')
  .option('-excludes --excludes [...name]', 'Exclude which packages')
  .option('-includes --includes [...name]', 'Include which packages')
  .action(analysisDependencies);
};
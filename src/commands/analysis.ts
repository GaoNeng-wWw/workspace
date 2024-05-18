import {Command} from 'commander';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import {error, info} from '../log';
import { exit } from 'process';
import { PackageGraph, readProjects } from '@pnpm/filter-workspace-packages';
import {Project} from '@pnpm/types';
import {Edge, Graph, Node, toDot, attribute as _} from 'ts-graphviz';
import { toFile } from '@ts-graphviz/adapter';

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
    const {dependencies} = graph[path];
    g.push([path, dependencies]);
  }
  return g;
};

export const analysisDependencies = async (path: string = '.') => {
  const resolvePath = resolve(path);
  if (!existsSync(resolvePath)){
    error('pnpm-workspace.yaml not exists');
    exit();
  }
  const {allProjectsGraph} = await readProjects(resolvePath, [], {engineStrict: false});
  const g = new Graph('', {
    [_.bgcolor]: '#141414',
    [_.rankdir]: 'LR',
    // [_.splines]: false,
  });
  const nodes = new Map();
  const graph = sort(allProjectsGraph);
  for (const [path, project] of Object.entries(allProjectsGraph)){
    if (!project.package.manifest.name){
      continue;
    }
    const node = new Node(project.package.manifest.name, {
      [_.fontcolor]: '#ffffffcc',
      [_.fillcolor]: '#222',
      [_.shape]: 'box',
      [_.style]: 'filled'
    });
    nodes.set(path, node);
  }
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
  program.command('analysis [path]').action(analysisDependencies);
};
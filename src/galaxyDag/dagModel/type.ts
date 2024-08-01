export interface RawNodeType {
  id: string;
}

export interface Edge {
  source: string;
  target: string;
}

export interface GraphModelOption<T> {
  nodes: T[];
  edges: Edge[];
  groupNumber: number;
  rootNode: T;
}

export interface EdgeType {
  source: string;
  target: string;
}

export enum NodeTypeEnum {
  Group = 'group',
  Normal = 'node',
}

import { NodeType, NodeTypeEnum } from '../../dag/type';

class BaseNode {
  id: any;
  type: any;
  layer: any;
  parents: Set<NodeType>;
  children: Set<NodeType>;
  data: any;

  constructor({ id, type, layer, data }) {
    this.id = id;
    this.type = type;
    this.layer = layer;
    this.parents = new Set();
    this.children = new Set();
    this.data = data || {};
  }
}

export class NormalNode extends BaseNode {
  groupNode: null;
  expanded: boolean;
  constructor(options) {
    const { expanded, ...restOptions } = options;
    super({ type: NodeTypeEnum.Normal, ...restOptions });
    this.groupNode = null;
    this.expanded = expanded;
  }
}

export class GroupNode extends BaseNode {
  subNodes: any;
  constructor(options) {
    const { subNodes, ...restOptions } = options;
    super({ type: NodeTypeEnum.Group, ...restOptions });
    this.subNodes = new Set();
    this.data.children = [];
    this.addSubNodes(subNodes);
  }
  addSubNode(node) {
    node.groupNode = this;
    this.subNodes.add(node);
    this.data.children.push(node);
  }
  addSubNodes(subNodes) {
    subNodes.forEach((node) => this.addSubNode(node));
  }
}

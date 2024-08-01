import { cloneDeep, pick, uniqueId } from 'lodash';
import { EdgeType, GraphModelOption, NodeTypeEnum } from './type';
import { GroupNode, NormalNode } from './node';
import { NodeType } from '../../dag/type';

const GROUP_ID = 'GROUP_ID_';

enum DirectionEnum {
  Up = 'up',
  Down = 'down',
}

const NEXT_NODES_KEY = {
  [DirectionEnum.Up]: 'parents',
  [DirectionEnum.Down]: 'children',
};

const getReverseDirection = (key) =>
  key === DirectionEnum.Up ? DirectionEnum.Down : DirectionEnum.Up;

const getReverseNextNodesKey = (key) => {
  return key === NEXT_NODES_KEY[DirectionEnum.Up]
    ? NEXT_NODES_KEY[DirectionEnum.Down]
    : NEXT_NODES_KEY[DirectionEnum.Up];
};

// TODO : 同层节点聚合的优先级，包括扩展节点。聚合可能影响之前聚合的节点分离。

export default class GraphModel<T> {
  edgeSet: Set<EdgeType>;
  nodeMap: Map<string, NodeType>;
  rawNodeMap: Map<string, T>;
  layerMap: Map<number, Set<NodeType>>;
  rootNodes: Set<NodeType>;
  groupNumber: number;
  rawRootNode: T;
  constructor({ nodes, edges, groupNumber, rootNode }: GraphModelOption<T>) {
    this.rawRootNode = rootNode;
    this.rawNodeMap = new Map();
    this.nodeMap = new Map();
    this.layerMap = new Map();
    this.edgeSet = new Set();
    this.rootNodes = new Set();
    this.groupNumber = groupNumber;
    this.init(nodes, edges);
  }
  init(nodes, edges) {
    this.clearGraph();
    const rootNode = this.createNode(this.rawRootNode);
    this.rootNodes.add(rootNode);
    this.processRawData(nodes, edges);
    this.generatorGraph();
  }
  processRawData(nodes, edges) {
    edges.forEach((edge) => {
      this.edgeSet.add(edge);
    });
    nodes.forEach((node) => {
      const { id } = node;
      if (!this.rawNodeMap.get(id)) {
        this.rawNodeMap.set(id, node);
      }
    });
  }
  createNode(rawNode: T) {
    const node: NodeType = new NormalNode({
      id: rawNode.id,
      expanded: rawNode.expanded ? true : false,
      data: rawNode.data,
    });
    this.nodeMap.set(node.id, node);
    return node;
  }
  establishNodeRelation(source, target, direction = DirectionEnum.Down) {
    if (direction === DirectionEnum.Up) {
      const tmpSource = source;
      source = target;
      target = tmpSource;
    }
    source.children.add(target);
    target.parents.add(source);
  }
  cancelRelationWithParentNode(source, target, direction = DirectionEnum.Down) {
    if (direction === DirectionEnum.Up) {
      const tmpSource = source;
      source = target;
      target = tmpSource;
    }
    source.children.delete(target);
    target.parents.delete(source);
  }
  generatorGraph() {
    this.generatorRelationGraph();
    this.separatedLayer();
    this.aggregation();
  }
  generatorRelationGraph() {
    this.edgeSet.forEach(({ source, target }) => {
      let sourceNode = this.nodeMap.get(source);
      let targetNode = this.nodeMap.get(target);
      if (!this.nodeMap.get(source)) {
        sourceNode = this.createNode(this.rawNodeMap.get(source)!);
      }
      if (!this.nodeMap.get(target)) {
        targetNode = this.createNode(this.rawNodeMap.get(target)!);
      }
      this.establishNodeRelation(sourceNode, targetNode);
    });
  }
  existNewNode(nodes, visitedNodes) {
    for (const node of nodes) {
      // if (node.type === NodeTypeEnum.Group) continue;
      if (!visitedNodes.has(node)) return true;
    }
    return false;
  }
  addSourceNodesToTargetNodes(sourceNodes, targetNodes) {
    sourceNodes.forEach((node) => {
      targetNodes.add(node);
    });
  }
  separatedLayer() {
    const callback = ({ node, layer }) => {
      let layerNodes = this.layerMap.get(layer);
      if (!layerNodes) {
        layerNodes = new Set();
        this.layerMap.set(layer, layerNodes);
      }
      if (node.layer !== undefined && node.layer !== layer) {
        const prevLayerNodes = this.layerMap.get(node.layer);
        prevLayerNodes?.delete(node);
      }
      node.layer = layer;
      layerNodes.add(node);
    };
    this.recursionBreadthTraverse({
      visitingNodes: new Set(this.rootNodes),
      direction: DirectionEnum.Down,
      callback,
    });
  }
  breadthTraverse({ nodes, direction, layer = 0, callback, verify }) {
    const visitedNodes = new Set();
    function traverse({ nodes, direction, layer }) {
      if (!nodes.size) return;
      const nextNodesKey = NEXT_NODES_KEY[direction];
      const nextLayer =
        direction === DirectionEnum.Down ? layer + 1 : layer - 1;
      const nextNodes = new Set();
      nodes.forEach((node) => {
        if (verify && verify(node)) return;
        callback({
          node,
          layer,
          direction,
          nextLayer,
          nextNodesKey,
          visitedNodes,
        });
        visitedNodes.add(node);
        node[nextNodesKey].forEach((nextNode) => {
          nextNodes.add(nextNode);
        });
      });
      traverse({
        nodes: nextNodes,
        direction,
        layer: nextLayer,
      });
    }
    traverse({ nodes, direction, layer });
    return visitedNodes;
  }
  recursionBreadthTraverse({
    visitingNodes,
    callback,
    direction,
    filterNextLayerNode,
  }) {
    const visitedNodes = new Set();
    const pendingNodes = new Set();
    const collectExpandNodeCallback = (params) => {
      const { node, direction } = params;
      const reverseDirection = getReverseDirection(direction);
      const reverseNextNodesKey = NEXT_NODES_KEY[reverseDirection];
      // 因为是层序遍历，如果出现上层节点没有遍历过的节点那这个节点可能是扩展出来的
      if (this.existNewNode(node[reverseNextNodesKey], visitedNodes)) {
        pendingNodes.add(node);
      }
      callback({ ...params, visitedNodes });
    };
    while (visitingNodes.size) {
      visitingNodes.forEach((node) => {
        const traverseVisitedNodes = this.breadthTraverse({
          nodes: new Set([node]),
          direction,
          callback: collectExpandNodeCallback,
          layer: node.layer,
          verify: (verifyNode) =>
            visitedNodes.has(verifyNode) && node !== verifyNode,
          filterNextLayerNode,
        });
        this.addSourceNodesToTargetNodes(traverseVisitedNodes, visitedNodes);
        visitingNodes.delete(node);
      });
      visitingNodes = new Set(pendingNodes);
      pendingNodes.clear();
      direction =
        direction === DirectionEnum.Down
          ? DirectionEnum.Up
          : DirectionEnum.Down;
    }
  }
  aggregation() {
    const nextLayerVisitedNodes = new Set();
    let prevLayer;
    const callback = ({
      layer,
      node,
      direction,
      nextNodesKey,
      nextLayer,
      visitedNodes,
    }) => {
      const nextLayerNodes = this.layerMap.get(nextLayer);
      // 查找下层节点是否可以聚合时排除已经遍历过的节点
      if (!prevLayer) {
        prevLayer = layer;
      }
      if (layer !== prevLayer) {
        nextLayerVisitedNodes.clear();
        prevLayer = layer;
      }
      const nextNodes = this.getNextNodes({
        node,
        direction,
        nextNodesKey,
        nextLayer,
        visitedNodes,
        nextLayerVisitedNodes,
      });
      // 判断下层节点是否聚合
      if (nextNodes.size >= this.groupNumber) {
        //TODO 扩展节点不聚合
        const groupNode = new GroupNode({
          id: uniqueId(GROUP_ID),
          subNodes: nextNodes,
          layer: nextLayer,
        });
        // 建立源节点和聚合节点的关系
        this.establishNodeRelation(node, groupNode, direction);
        nextNodes.forEach((childNode) => {
          //聚合代替原节点建立和目标节点的关系
          childNode[nextNodesKey].forEach((nextNode) => {
            this.establishNodeRelation(groupNode, nextNode, direction);
            this.cancelRelationWithParentNode(childNode, nextNode, direction);
          });
          const reverseNextNodesKey = getReverseNextNodesKey(nextNodesKey);
          //聚合代替原节点建立和源节点的关系
          childNode[reverseNextNodesKey].forEach((prevNode) => {
            this.establishNodeRelation(prevNode, groupNode, direction);
            this.cancelRelationWithParentNode(prevNode, childNode, direction);
          });
          //聚合节点的子节点从下层中剔除
          nextLayerNodes?.delete(childNode);
        });
        // 将生成的聚合节点添加到下层中
        nextLayerNodes?.add(groupNode);
      }
    };

    // 只遍历下层节点
    const filterNextLayerNode = ({ nextNode, nextLayer }) =>
      nextNode.layer === nextLayer;

    // 处理扩展节点的聚合
    this.recursionBreadthTraverse({
      visitingNodes: new Set(this.rootNodes),
      direction: DirectionEnum.Down,
      callback,
      filterNextLayerNode,
    });
  }
  getNextNodes({
    node,
    direction,
    nextNodesKey,
    nextLayer,
    visitedNodes,
    nextLayerVisitedNodes,
  }) {
    const nextNodes = new Set();
    //可能存在普通节点和聚合节点的区别，聚合节点的下层节点的关系已处理好
    node[nextNodesKey].forEach((nextNode) => {
      // 节点已经遍历过，并且在之前已经生成聚合节点
      // if (visitedNodes.has(nextNode) && nextNode.groupNode) {
      //   this.establishNodeRelation(node, nextNode.groupNode, direction);
      //   this.cancelRelationWithParentNode(node, nextNode, direction);
      // }
      if (
        !visitedNodes.has(nextNode) &&
        !nextLayerVisitedNodes.has(nextNode) &&
        nextNode.layer === nextLayer &&
        nextNode.type === NodeTypeEnum.Normal &&
        !nextNode.expanded
      ) {
        nextNodes.add(nextNode);
        nextLayerVisitedNodes.add(nextNode);
      }
    });
    return nextNodes;
  }
  layerTraverseNodes({ direction, layer, callback }) {
    if (!this.layerMap.has(layer)) return;
    const nextLayer = direction === DirectionEnum.Down ? layer + 1 : layer - 1;
    const nextNodesKey = NEXT_NODES_KEY[direction];
    const layerNodes = this.layerMap.get(nextLayer);
    this.layerMap.get(layer)!.forEach((node) => {
      callback({ layer, node, direction, nextNodesKey, nextLayer, layerNodes });
    });
    this.layerTraverseNodes({ direction, layer: nextLayer, callback });
  }
  clearGraph() {
    this.rootNodes.clear();
    this.nodeMap.clear();
    this.layerMap.clear();
  }
  expandNode(id, nodes = [], edges = []) {
    const node = this.rawNodeMap.get(id);
    if (!node) return;
    node.expanded = true;
    this.init(nodes, edges);
  }
  updateRawNodeData(id, update) {
    const node = this.rawNodeMap.get(id);
    if (!node) return;
    node.data = { ...node.data, ...update };
  }
  getGroupNode(id) {
    const node = this.nodeMap.get(id);
    if (!node) return;
    return node.groupNode;
  }
  getNodeData(node, processNode) {
    let nodeData = cloneDeep(pick(node, ['id', 'type', 'data']));
    if (processNode) {
      nodeData = processNode(nodeData);
    }
    if (nodeData.type === NodeTypeEnum.Group) {
      nodeData.data.children = nodeData.data.children.map((node) =>
        this.getNodeData(node, processNode)
      );
    }
    return nodeData;
  }
  generatorData(processNode) {
    const nodeMap = {};
    const edgeMap = {};

    const callback = ({ node, direction, nextNodesKey, visitedNodes }) => {
      const { id, type, data } = node;
      const nodeData = { id, type, data };
      nodeMap[node.id] = this.getNodeData(nodeData, processNode);
      node[nextNodesKey].forEach((target) => {
        if (direction === DirectionEnum.Up) {
          const edgeKey = `${target.id}-${id}`;
          edgeMap[edgeKey] = { source: target.id, target: id, id: edgeKey };
        } else if (direction === DirectionEnum.Down) {
          const edgeKey = `${id}-${target.id}`;
          edgeMap[edgeKey] = { source: id, target: target.id, id: edgeKey };
        }
      });
    };

    // 收集扩展的节点和边
    this.recursionBreadthTraverse({
      visitingNodes: new Set(this.rootNodes),
      direction: DirectionEnum.Down,
      callback,
    });

    return {
      nodes: Object.values(nodeMap),
      edges: Object.values(edgeMap),
    };
  }
}

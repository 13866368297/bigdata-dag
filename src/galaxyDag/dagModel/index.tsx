import { useEffect, useRef, useState } from 'react';
import { Graph, Path, register, useGraphStore } from '@antv/xflow';
import GraphModel from './graphModel';
import { NodeTypeEnum, RawNodeType } from './type';
import DagGraph from '../dagGraph';

export default function DagModel({
  modelOptions,
  nodes,
  dagModelRef: externalDagModelRef,
  dagGraphRef: externalDagGraphRef,
}) {
  const [data, setData] = useState(null);
  const dagModelRef = useRef(null);
  const innerDagGraphRef = useRef(null);
  const dagGraphRef = externalDagGraphRef
    ? externalDagGraphRef
    : innerDagGraphRef;

  const getData = () => {
    const data = dagModelRef.current.generatorData((node) => {
      const { type } = node;
      node.width = nodes[type].width;
      node.height = nodes[type].height;
      node.shape = nodes[type].shape;
      return node;
    });
    console.log('data', data);

    setData(data);
  };

  const createDagModel = () => {
    dagModelRef.current = new GraphModel<RawNodeType>(modelOptions);
    externalDagModelRef.current = {};
    Object.setPrototypeOf(externalDagModelRef.current, dagModelRef.current);
    externalDagModelRef.current.expandNodeAndUpdate = (...args) => {
      dagModelRef.current.expandNode(...args);
      getData();
      setTimeout(() => {
        const id = args[0];
        dagGraphRef.current.select(id);
        const node = dagGraphRef.current.getCellById(id);
        if (node) {
          dagGraphRef.current.centerCell(node);
          const edges = dagGraphRef.current.getConnectedEdges(node);
          console.log('edges', edges);
        }
      });
    };
  };

  const registerNodes = () => {
    Object.values(nodes).forEach((node) => register(node));
  };

  useEffect(() => {
    createDagModel();
    registerNodes();
    getData();
  }, []);

  return (
    <>{data && <DagGraph data={data} dagGraphRef={dagGraphRef}></DagGraph>}</>
  );
}

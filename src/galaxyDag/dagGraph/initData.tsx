import { useCallback, useEffect, useMemo, useState } from 'react';
import { CircularLayout, DagreLayout, GridLayout } from '@antv/layout';
import {
  Graph,
  Point,
  register,
  useGraphEvent,
  useGraphStore,
} from '@antv/xflow';

import { GalaxyDagProps } from './type';
import { DAG_EDGE } from './constant';
import { layout } from '../../../xflow2-layout/layout';

const InitData = ({ data: dataSrouce }: GalaxyDagProps) => {
  const initData = useGraphStore((state) => state.initData);

  const dagreLayout = (data) => {
    let maxHeight = 0;
    let maxWidth = 0;
    data.nodes.forEach((node) => {
      maxHeight = Math.max(maxHeight, node.height);
      maxWidth = Math.max(maxWidth, node.width);
    });
    const dagreLayoutInstance = new DagreLayout({
      type: 'dagre',
      rankdir: 'TB', // 可选，默认为图的中心
      nodesep: maxWidth / 3, // 可选
      ranksep: maxHeight / 2, // 可选
      // controlPoints: true, // 可选
    });
    return dagreLayoutInstance.layout(data);
  };

  const addCustomEdge = (edges) => {
    edges.forEach((edge) => {
      edge.shape = DAG_EDGE;
    });
  };

  useEffect(() => {
    const model = dagreLayout(dataSrouce);
    addCustomEdge(model.edges);
    // const model = layout(dataSrouce);
    // console.log('model', model);
    initData(model);
  }, [initData, dataSrouce]);

  return null;
};
export default InitData;

import { Graph } from '@antv/xflow';
import { DAG_EDGE, DAG_ROUTER } from './constant';

Graph.registerRouter(DAG_ROUTER, function (vertices, args, view, ...args1) {
  const { sourceAnchor, targetAnchor } = view;
  const sourceHeight = view.sourceView.cell.store.data.size.height;
  const targetHeight = view.targetView.cell.store.data.size.height;
  const s = {
    x: sourceAnchor.x,
    y: sourceAnchor.y + sourceHeight / 2,
  };

  const dy = Math.floor((targetAnchor.y - targetHeight / 2 - s.y) / 2);
  // const dy = Math.floor((targetAnchor.y - sourceAnchor.y) / 3);

  const c1 = {
    x: s.x,
    y: s.y + dy,
  };

  const c2 = {
    x: targetAnchor.x,
    y: s.y + dy,
  };

  const t = {
    x: c2.x,
    y: targetAnchor.y - targetHeight / 2,
  };

  return [c1, c2];
});

Graph.registerEdge(
  DAG_EDGE,
  {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#999',
        strokeWidth: 1,
      },
    },
    zIndex: -1,
    connector: 'rounded',
    router: DAG_ROUTER,
  },
  true
);

import React, { FC, useState } from 'react';
import {
  Background,
  Grid,
  Minimap,
  Portal,
  Snapline,
  XFlow,
  XFlowGraph,
} from '@antv/xflow';
import './registerEdge';

import { Scale } from './constant';
import InitData from './initData';
import Toolbar from './toolbar';
import './index.less';
import { GalaxyDagProps } from './type';
import BindDagGraph from './bindDagGraph';

const X6ReactPortalProvider = Portal.getProvider();

/**
 * 示例组件
 * @param props
 * @constructor
 */
const GalaxyDag: FC<GalaxyDagProps> = ({ data, dagGraphRef }) => {
  const [showMap, setShowMap] = useState(true);
  const controllMap = () => setShowMap(!showMap);

  return (
    <XFlow>
      <X6ReactPortalProvider></X6ReactPortalProvider>
      <Toolbar controllMap={controllMap} />
      <XFlowGraph
        minScale={Scale.Min}
        maxScale={Scale.Max}
        pannable
        // scroller={true}
        zoomable
        centerView
        // virtual
        // readonly
        // fitView
        // selectOptions={{
        //   enabled: false,
        // }}
        // connectionEdgeOptions={{
        //   //   attrs: {
        //   //     line: {
        //   //       stroke: '#000',
        //   //       strokeWidth: 1,
        //   //     },
        //   //   },
        //   shape: DAG_EDGE,
        //   zIndex: 0,
        // }}
        // connectionOptions={{
        //   connector: 'rounded',
        //   router: DAG_ROUTER,
        // }}
        selectOptions={{
          //   className: NODE_SELECTED_CLASS,
          showNodeSelectionBox: true,
          pointerEvents: 'none',
        }}
      />
      {/* <Registor registers={registers}></Registor> */}
      {/* <Grid type="dot" options={undefined} /> */}
      {/* <Background color="#f8f8fa" /> */}
      {/* {showMap && <Minimap className="mini-map" width={200} height={120} />} */}
      <Snapline sharp />
      <InitData data={data} />
      <BindDagGraph dagGraphRef={dagGraphRef}></BindDagGraph>
    </XFlow>
  );
};

export default GalaxyDag;

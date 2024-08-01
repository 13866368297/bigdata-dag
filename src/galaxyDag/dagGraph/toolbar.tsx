import React, { useEffect, useState } from 'react';
import { useGraphInstance } from '@antv/xflow';

import { Scale } from './constant';
import GraphToolBar from './graphToolbar';
export default function Toolbar(props) {
  const { controllMap } = props;
  const graph = useGraphInstance();
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => {
    if (zoom >= Scale.Max) return;
    const newZoom = zoom + 0.1;
    graph!.zoomTo(newZoom);
    setZoom(newZoom);
  };
  const zoomOut = () => {
    if (zoom <= Scale.Min) return;
    const newZoom = zoom - 0.1;
    graph!.zoomTo(newZoom);
    setZoom(newZoom);
  };

  const zoomFit = () => {
    const newZoom = 1;
    graph!.zoomTo(newZoom);
    setZoom(newZoom);
  };

  const zoomCenter = () => {
    const newZoom = 1;
    graph!.zoomToFit({ maxScale: 1 });
    setZoom(newZoom);
  };

  useEffect(() => {
    if (graph) {
      setZoom(graph.zoom());
    }
  }, [graph]);

  return (
    <div className="tool-bar">
      <GraphToolBar
        graphInstance={graph}
        toLocPos={zoomCenter}
        refresh={zoomCenter}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        zoomFit={zoomFit}
      />
    </div>
    // <div className="tool-bar">
    //   <div className="tool-bar-wrap">
    //     <i className="gonggongtubiao guanbiditu" onClick={controllMap}></i>
    //     <i className="gonggongtubiao shitu-fangda" onClick={zoomIn}></i>
    //     <i className="gonggongtubiao shitu-suoxiao" onClick={zoomOut}></i>
    //     <i className="gonggongtubiao shitu-bi" onClick={zoomFit}></i>
    //     <i className="gonggongtubiao shitu-shipeichuangkou" onClick={zoomCenter}></i>
    //   </div>
    // </div>
  );
}

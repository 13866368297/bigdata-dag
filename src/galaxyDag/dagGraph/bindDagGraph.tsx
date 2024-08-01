import { useGraphInstance } from '@antv/xflow';
import { useEffect } from 'react';

export default function BindDagGraph({ dagGraphRef }) {
  const graph = useGraphInstance();

  useEffect(() => {
    dagGraphRef.current = graph;
  }, [graph]);

  return null;
}

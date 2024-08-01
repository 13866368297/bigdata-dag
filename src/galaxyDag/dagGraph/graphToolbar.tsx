import React from 'react';
import {
  AimOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';

interface GraphToolBarProps {
  graphInstance: any;
  refresh: Function;
  toLocPos: Function;
  zoomIn: Function;
  zoomOut: Function;
  zoomFit: Function;
  /** 是否支持全屏 */
  supportFullScreen?: boolean;
  /** 全屏/取消全屏 */
  isFullScreen?: boolean;
  /** 全屏/取消全屏的响应事件 */
  onFullScreen?: Function;
}

const toolTipPlacement = 'leftTop';

const GraphToolBar: React.FC<GraphToolBarProps> = function ({
  graphInstance,
  refresh,
  toLocPos,
  zoomIn,
  zoomOut,
  zoomFit,
  supportFullScreen = false,
  isFullScreen = false,
  onFullScreen,
}) {
  const iconStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#8B8FA8',
    cursor: 'pointer',
    margin: 0,
  };

  return (
    <>
      <div
        className="depend-graph-toolbar-w"
        style={{ width: '140px', display: 'flex' }}
      >
        <Tooltip placement={toolTipPlacement} title="定位">
          <span className="depend-graph-toolbar-item">
            <AimOutlined style={iconStyle} onClick={() => toLocPos()} />
          </span>
        </Tooltip>
        <Tooltip placement={toolTipPlacement} title="布局">
          <span className="depend-graph-toolbar-item">
            <ReloadOutlined
              onClick={() => refresh()}
              style={{ ...iconStyle, fontSize: 15 }}
            />
          </span>
        </Tooltip>
        {supportFullScreen ? (
          isFullScreen ? (
            <Tooltip placement={toolTipPlacement} title="取消全屏">
              <span className="depend-graph-toolbar-item">
                <FullscreenExitOutlined
                  onClick={() => onFullScreen?.(false)}
                  style={{ ...iconStyle, fontSize: 15 }}
                />
              </span>
            </Tooltip>
          ) : (
            <Tooltip placement={toolTipPlacement} title="全屏">
              <span className="depend-graph-toolbar-item">
                <FullscreenOutlined
                  onClick={() => onFullScreen?.(true)}
                  style={{ ...iconStyle, fontSize: 15 }}
                />
              </span>
            </Tooltip>
          )
        ) : null}
        <Tooltip placement={toolTipPlacement} title="放大">
          <span className="depend-graph-toolbar-item">
            <ZoomInOutlined
              style={iconStyle}
              onClick={() => {
                zoomIn();
              }}
            />
          </span>
        </Tooltip>
        <Tooltip placement={toolTipPlacement} title="缩小">
          <span className="depend-graph-toolbar-item">
            <ZoomOutOutlined
              style={iconStyle}
              onClick={() => {
                zoomOut();
              }}
            />
          </span>
        </Tooltip>
      </div>
    </>
  );
};

export default GraphToolBar;

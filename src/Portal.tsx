import * as React from 'react';
import { createPortal } from 'react-dom';
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import OrderContext from './Context';
import useDom from './useDom';
import useScrollLocker from './useScrollLocker';
import { inlineMock } from './mock';

export type ContainerType = Element | DocumentFragment;

export type GetContainer =
  | string
  | ContainerType
  | (() => ContainerType)
  | false;

export interface PortalProps {
  /** Customize container element. Default will create a div in document.body when `open` */
  getContainer?: GetContainer;
  children?: React.ReactNode;
  /** Show the portal children */
  open?: boolean;
  /** Lock screen scroll when open */
  autoLock?: boolean;
}

const getPortalContainer = (getContainer: GetContainer) => {
  if (getContainer === false) {
    return false;
  }

  if (!canUseDom()) {
    return null;
  }

  if (typeof getContainer === 'string') {
    return document.querySelector(getContainer);
  }
  if (typeof getContainer === 'function') {
    return getContainer();
  }
  return getContainer;
};

export default function Portal(props: PortalProps) {
  const { open, autoLock, getContainer, children } = props;

  const [mergedRender, setMergedRender] = React.useState(open);

  useScrollLocker(autoLock && open);

  // ====================== Should Render ======================
  React.useEffect(() => {
    setMergedRender(open);
  }, [open]);

  // ======================== Container ========================
  const customizeContainer = getPortalContainer(getContainer);

  const [defaultContainer, queueCreate] = useDom(
    mergedRender && !customizeContainer,
  );
  const mergedContainer = customizeContainer ?? defaultContainer;

  // ========================= Render ==========================
  // Do not render when nothing need render
  if (!mergedRender || !canUseDom()) {
    return null;
  }

  // Render inline
  const renderInline = mergedContainer === false || inlineMock();

  return (
    <OrderContext.Provider value={queueCreate}>
      {renderInline ? children : createPortal(children, mergedContainer)}
    </OrderContext.Provider>
  );
}

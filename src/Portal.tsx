import * as React from 'react';
import { createPortal } from 'react-dom';
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import { supportRef, useComposeRef } from 'rc-util/lib/ref';
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
  /** Remove `children` when `open` is `false`. Set `false` will not handle remove process */
  autoDestroy?: boolean;
  /** Lock screen scroll when open */
  autoLock?: boolean;

  /** @private debug name. Do not use in prod */
  debug?: string;
}

const getPortalContainer = (getContainer: GetContainer) => {
  if (getContainer === false) {
    return false;
  }

  if (!canUseDom() || !getContainer) {
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

const Portal = React.forwardRef<any, PortalProps>((props, ref) => {
  const {
    open,
    autoLock,
    getContainer,
    debug,
    autoDestroy = true,
    children,
  } = props;

  const [shouldRender, setShouldRender] = React.useState(open);

  const mergedRender = shouldRender || open;

  // ====================== Should Render ======================
  React.useEffect(() => {
    if (autoDestroy || open) {
      setShouldRender(open);
    }
  }, [open, autoDestroy]);

  // ======================== Container ========================
  const [innerContainer, setInnerContainer] = React.useState<
    ContainerType | false
  >(() => getPortalContainer(getContainer));

  React.useEffect(() => {
    const customizeContainer = getPortalContainer(getContainer);

    // Tell component that we check this in effect which is safe to be `null`
    setInnerContainer(customizeContainer ?? null);
  });

  const [defaultContainer, queueCreate] = useDom(
    mergedRender && !innerContainer,
    debug,
  );
  const mergedContainer = innerContainer ?? defaultContainer;

  // ========================= Locker ==========================
  useScrollLocker(
    autoLock &&
      open &&
      canUseDom() &&
      (mergedContainer === defaultContainer ||
        mergedContainer === document.body),
  );

  // =========================== Ref ===========================
  let childRef: React.Ref<any> = null;

  if (children && supportRef(children) && ref) {
    ({ ref: childRef } = children as any);
  }

  const mergedRef = useComposeRef(childRef, ref);

  // ========================= Render ==========================
  // Do not render when nothing need render
  // When innerContainer is `undefined`, it may not ready since user use ref in the same render
  if (!mergedRender || !canUseDom() || innerContainer === undefined) {
    return null;
  }

  // Render inline
  const renderInline = mergedContainer === false || inlineMock();

  let reffedChildren = children;
  if (ref) {
    reffedChildren = React.cloneElement(children as any, {
      ref: mergedRef,
    });
  }

  return (
    <OrderContext.Provider value={queueCreate}>
      {renderInline
        ? reffedChildren
        : createPortal(reffedChildren, mergedContainer)}
    </OrderContext.Provider>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Portal.displayName = 'Portal';
}

export default Portal;

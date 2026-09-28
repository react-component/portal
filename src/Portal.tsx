import {
  canUseDom,
  getNodeRef,
  supportRef,
  useComposeRef,
  warning,
} from '@rc-component/util';
import * as React from 'react';
import { createPortal } from 'react-dom';
import OrderContext from './Context';
import { inlineMock } from './mock';
import useDom from './useDom';
import useScrollLocker from './useScrollLocker';
import useEscKeyDown from './useEscKeyDown';

export type ContainerType = Element | DocumentFragment;

export type GetContainer =
  | string
  | ContainerType
  | (() => ContainerType)
  | false;

export type EscCallback = ({
  top,
  event,
}: {
  top: boolean;
  event: KeyboardEvent;
}) => void;

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
  onEsc?: EscCallback;

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
    onEsc,
  } = props;

  const [shouldRender, setShouldRender] = React.useState(open);

  const mergedRender = shouldRender || open;

  // ========================= Warning =========================
  if (process.env.NODE_ENV !== 'production') {
    warning(
      canUseDom() || !open,
      `Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.`,
    );
  }

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
    // Tell component that we check this in effect which is safe to be `null`
    const customizeContainer = getPortalContainer(getContainer) ?? null;

    // Re-resolved after every render — a stable `getContainer` may close over a
    // ref whose element changes — but only a changed container is stored. React
    // skips a same-value update only while this fiber has no pending lane; once
    // one lingers, every no-op call schedules a render, and a parent re-rendering
    // on each keystroke stacks those renders into "Maximum update depth exceeded".
    if (customizeContainer !== innerContainer) {
      setInnerContainer(customizeContainer);
    }
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

  // ========================= Esc Keydown ==========================
  useEscKeyDown(open, onEsc);

  // =========================== Ref ===========================
  let childRef: React.Ref<any> = null;

  if (children && supportRef(children) && ref) {
    childRef = getNodeRef(children);
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

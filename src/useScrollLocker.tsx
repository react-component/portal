import * as React from 'react';
import { updateCSS, removeCSS } from 'rc-util/lib/Dom/dynamicCSS';
import useLayoutEffect, {
  useLayoutUpdateEffect,
} from 'rc-util/lib/hooks/useLayoutEffect';
import getScrollBarSize from 'rc-util/lib/getScrollBarSize';
import { isBodyOverflowing } from './util';

let lockCount = 0;
let locked = false;

const UNIQUE_ID = `rc-util-locker-${Date.now()}`;

function syncLocker() {
  const nextLocked = lockCount > 0;

  if (locked !== nextLocked) {
    locked = nextLocked;

    if (locked) {
      const scrollbarSize = getScrollBarSize();
      const isOverflow = isBodyOverflowing();

      updateCSS(
        `
html body {
  overflow-y: hidden;
  ${isOverflow ? `width: calc(100% - ${scrollbarSize}px);` : ''}
}`,
        UNIQUE_ID,
      );
    } else {
      removeCSS(UNIQUE_ID);
    }
  }
}

export default function useScrollLocker(lock?: boolean) {
  const mergedLock = !!lock;

  // Init only check lock
  useLayoutEffect(() => {
    if (mergedLock) {
      lockCount += 1;
      syncLocker();
    }
  }, []);

  // Update will both check the lock state
  useLayoutUpdateEffect(() => {
    if (mergedLock) {
      lockCount += 1;
      syncLocker();
    } else {
      lockCount -= 1;
      syncLocker();
    }
  }, [mergedLock]);

  const lockRef = React.useRef(mergedLock);
  lockRef.current = mergedLock;

  useLayoutEffect(() => {
    return () => {
      if (lockRef.current) {
        lockCount -= 1;
        syncLocker();
      }
    };
  }, []);
}

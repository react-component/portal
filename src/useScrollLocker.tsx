import * as React from 'react';
import { updateCSS, removeCSS } from '@rc-component/util/lib/Dom/dynamicCSS';
import useLayoutEffect from '@rc-component/util/lib/hooks/useLayoutEffect';
import { getTargetScrollBarSize } from '@rc-component/util/lib/getScrollBarSize';
import { isBodyOverflowing } from './util';

const UNIQUE_ID = `rc-util-locker-${Date.now()}`;

let uuid = 0;

export interface UseScrollLockerOptions {
  lock?: boolean;
  nonce?: string;
}

export default function useScrollLocker(
  lock?: boolean | UseScrollLockerOptions,
) {
  const options = typeof lock === 'object' ? lock : { lock };
  const mergedLock = !!(typeof lock === 'boolean' ? lock : options.lock);
  const nonce = typeof lock === 'object' ? lock.nonce : undefined;

  const [id] = React.useState(() => {
    uuid += 1;
    return `${UNIQUE_ID}_${uuid}`;
  });

  useLayoutEffect(() => {
    if (mergedLock) {
      const scrollbarSize = getTargetScrollBarSize(document.body).width;
      const isOverflow = isBodyOverflowing();

      updateCSS(
        `
html body {
  overflow-y: hidden;
  ${isOverflow ? `width: calc(100% - ${scrollbarSize}px);` : ''}
}`,
        id,
        {
          csp: nonce ? { nonce } : undefined,
        },
      );
    } else {
      removeCSS(id);
    }

    return () => {
      removeCSS(id);
    };
  }, [mergedLock, id, nonce]);
}

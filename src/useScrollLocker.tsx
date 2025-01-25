import * as React from 'react';
import { updateCSS, removeCSS } from '@rc-component/util/lib/Dom/dynamicCSS';
import useLayoutEffect from '@rc-component/util/lib/hooks/useLayoutEffect';
import { getTargetScrollBarSize } from '@rc-component/util/lib/getScrollBarSize';
import { isBodyOverflowing } from './util';

const UNIQUE_ID = `@rc-component/util-locker-${Date.now()}`;

let uuid = 0;

const useScrollLocker = (lock?: boolean) => {
  const mergedLock = !!lock;
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
      );
    } else {
      removeCSS(id);
    }

    return () => {
      removeCSS(id);
    };
  }, [mergedLock, id]);
};

export default useScrollLocker;

import { useEffect, useMemo } from 'react';
import { type EscCallback } from './Portal';
import useId from '@rc-component/util/lib/hooks/useId';
import { useEvent } from '@rc-component/util';

export let stack: string[] = []; // export for testing

const IME_LOCK_DURATION = 200;
let lastCompositionEndTime = 0;

export function resetEscKeyDownLock() {
  lastCompositionEndTime = 0;
}

export default function useEscKeyDown(open: boolean, onEsc?: EscCallback) {
  const id = useId();

  const handleEscKeyDown = useEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.isComposing) {
      const now = Date.now();
      if (now - lastCompositionEndTime < IME_LOCK_DURATION) {
        return;
      }

      const top = stack[stack.length - 1] === id;
      onEsc?.({ top, event });
    }
  });

  const handleCompositionEnd = useEvent(() => {
    lastCompositionEndTime = Date.now();
  });

  useMemo(() => {
    if (open && !stack.includes(id)) {
      stack.push(id);
    } else if (!open) {
      stack = stack.filter(item => item !== id);
    }
  }, [open, id]);

  useEffect(() => {
    if (open && !stack.includes(id)) {
      stack.push(id);
    }

    if (!open) {
      return;
    }

    window.addEventListener('keydown', handleEscKeyDown);
    window.addEventListener('compositionend', handleCompositionEnd);

    return () => {
      stack = stack.filter(item => item !== id);
      window.removeEventListener('keydown', handleEscKeyDown);
      window.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [open, id]);
}

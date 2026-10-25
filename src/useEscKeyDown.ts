import { useEvent, useId } from '@rc-component/util';
import { useEffect, useMemo } from 'react';
import { type EscCallback } from './Portal';

// `mounted`: the entry's effect has run. A render pushes provisionally (so a parent lands below its
// children), but React can throw a render away: in StrictMode (React 18) a mounting component renders
// twice with a different `useId` each time, and only the second ever runs effects. An entry no effect
// claimed belongs to a discarded render, so it never takes part in Escape.
let stack: { id: string; onEsc?: EscCallback; mounted?: boolean }[] = [];

const IME_LOCK_DURATION = 200;
let lastCompositionEndTime = 0;

// Export for testing
export const _test =
  process.env.NODE_ENV === 'test'
    ? () => ({
        stack,
        reset: () => {
          // Not reset stack to ensure effect will clean up correctly
          lastCompositionEndTime = 0;
        },
      })
    : null;

// Global event handlers
const onGlobalKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !event.isComposing) {
    const now = Date.now();
    if (now - lastCompositionEndTime < IME_LOCK_DURATION) {
      return;
    }

    const live = stack.filter(item => item.mounted);
    const len = live.length;
    for (let i = len - 1; i >= 0; i -= 1) {
      live[i].onEsc({
        top: i === len - 1,
        event,
      });
    }
  }
};

const onGlobalCompositionEnd = () => {
  lastCompositionEndTime = Date.now();
};

function attachGlobalEventListeners() {
  window.addEventListener('keydown', onGlobalKeyDown);
  window.addEventListener('compositionend', onGlobalCompositionEnd);
}

function detachGlobalEventListeners() {
  if (stack.length === 0) {
    window.removeEventListener('keydown', onGlobalKeyDown);
    window.removeEventListener('compositionend', onGlobalCompositionEnd);
  }
}

export default function useEscKeyDown(open: boolean, onEsc?: EscCallback) {
  const id = useId();

  const onEventEsc = useEvent(onEsc);

  const ensure = (mounted: boolean) => {
    const item = stack.find(item => item.id === id);
    if (!item) {
      stack.push({ id, onEsc: onEventEsc, mounted });
    } else if (mounted) {
      item.mounted = true;
    }
  };

  const clear = () => {
    stack = stack.filter(item => item.id !== id);
    // Nothing live left: entries no effect ever claimed can go too.
    if (!stack.some(item => item.mounted)) {
      stack = [];
    }
  };

  useMemo(() => {
    if (open) {
      ensure(false);
    } else if (!open) {
      clear();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      ensure(true);
      // Attach global event listeners
      attachGlobalEventListeners();

      return () => {
        clear();
        // Remove global event listeners if instances is empty
        detachGlobalEventListeners();
      };
    }
  }, [open]);
}

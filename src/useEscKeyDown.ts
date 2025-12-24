import { useEffect, useMemo } from 'react';
import { type EscCallback } from './Portal';
import useId from '@rc-component/util/lib/hooks/useId';
import { useEvent } from '@rc-component/util';

export let stack: string[] = []; // export for testing

export default function useEscKeyDown(open: boolean, onEsc?: EscCallback) {
  const id = useId();

  const handleEscKeyDown = useEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.isComposing) {
      const top = stack[stack.length - 1] === id;
      onEsc?.({ top, event });
    }
  });

  useMemo(() => {
    if (open && !stack.includes(id)) {
      stack.push(id);
    } else if (!open) {
      stack = stack.filter(item => item !== id);
    }
  }, [open, id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    window.addEventListener('keydown', handleEscKeyDown);

    return () => {
      stack = stack.filter(item => item !== id);
      window.removeEventListener('keydown', handleEscKeyDown);
    };
  }, [open, id]);
}

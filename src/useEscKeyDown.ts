import { useEffect, useMemo } from 'react';
import { type EscCallback } from './Portal';
import useId from '@rc-component/util/lib/hooks/useId';
import { useEvent } from '@rc-component/util';

let stack: string[] = [];

export default function useEscKeyDown(open: boolean, onEsc?: EscCallback) {
  const id = useId();

  const handleEscKeyDown = useEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const top = stack[stack.length - 1] === id;
      onEsc?.({ top, event });
    }
  });

  useMemo(() => {
    if (open) {
      stack.push(id);
    } else {
      stack = stack.filter(item => item !== id);
    }
  }, [open, id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    window.addEventListener('keydown', handleEscKeyDown);

    return () => {
      window.removeEventListener('keydown', handleEscKeyDown);
    };
  }, [open, id]);
}

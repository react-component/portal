import { useEffect, useRef } from 'react';
import { type EscCallback } from './Portal';
import useId from '@rc-component/util/lib/hooks/useId';
import { useEvent } from '@rc-component/util';

let stack: string[] = [];

export default function useEscKeyDown(open: boolean, onEsc?: EscCallback) {
  const id = useId();
  const inStackRef = useRef(false);

  const handleEscKeyDown = useEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const top = stack[stack.length - 1] === id;
      onEsc?.({ top, event });
    }
  });

  if (open) {
    if (!inStackRef.current) {
      stack.push(id);
      inStackRef.current = true;
    }
  } else {
    if (inStackRef.current) {
      stack = stack.filter(item => item !== id);
      inStackRef.current = false;
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    window.addEventListener('keydown', handleEscKeyDown);

    return () => {
      if (inStackRef.current) {
        stack = stack.filter(item => item !== id);
        inStackRef.current = false;
      }
      window.removeEventListener('keydown', handleEscKeyDown);
    };
  }, [open, id]);
}

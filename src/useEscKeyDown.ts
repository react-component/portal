import { useEffect, useContext } from 'react';
import { type EscCallback } from './Portal';
import useId from '@rc-component/util/lib/hooks/useId';
import { useEvent } from '@rc-component/util';
import OrderContext from './Context';

let stack: string[] = [];

export default function useEscKeyDown(open: boolean, onEsc?: EscCallback) {
  const id = useId();

  const queueCreate = useContext(OrderContext);

  const handleEscKeyDown = useEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const isTop = stack[stack.length - 1] === id;
      onEsc?.({ isTop, event });
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const pushToStack = () => {
      stack.push(id);
    };

    if (queueCreate) {
      queueCreate(pushToStack);
    } else {
      pushToStack();
    }

    window.addEventListener('keydown', handleEscKeyDown);

    return () => {
      stack = stack.filter(item => item !== id);
      window.removeEventListener('keydown', handleEscKeyDown);
    };
  }, [open, id]);
}

import { useCallback, useRef, useState } from 'react';

export function useCollapse(initiallyOpen = true) {
  const [open, setOpen] = useState(initiallyOpen);
  const bodyRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    setOpen(prev => {
      const next = !prev;
      if (bodyRef.current) {
        if (!next) {
          bodyRef.current.style.maxHeight = bodyRef.current.scrollHeight + 'px';
          requestAnimationFrame(() => {
            if (bodyRef.current) bodyRef.current.style.maxHeight = '0';
          });
        } else {
          bodyRef.current.style.maxHeight = bodyRef.current.scrollHeight + 'px';
          const onTransitionEnd = () => {
            if (bodyRef.current) bodyRef.current.style.maxHeight = 'none';
            bodyRef.current?.removeEventListener('transitionend', onTransitionEnd);
          };
          bodyRef.current.addEventListener('transitionend', onTransitionEnd);
        }
      }
      return next;
    });
  }, []);

  return { open, toggle, bodyRef };
}

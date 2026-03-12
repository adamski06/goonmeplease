import { useRef, useState, useCallback, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function useNodeExpand(entityId: string) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mountReady, setMountReady] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const raf1Ref = useRef<number | null>(null);
  const raf2Ref = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearAnimationHandles = useCallback(() => {
    if (raf1Ref.current !== null) {
      cancelAnimationFrame(raf1Ref.current);
      raf1Ref.current = null;
    }
    if (raf2Ref.current !== null) {
      cancelAnimationFrame(raf2Ref.current);
      raf2Ref.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openNode = useCallback(() => {
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    clearAnimationHandles();
    setIsExpanded(true);
    setIsClosing(false);
    setMountReady(false);
  }, [clearAnimationHandles]);

  const setOverlayRef = useCallback((el: HTMLDivElement | null) => {
    overlayRef.current = el;
  }, []);

  const closeNode = useCallback(() => {
    if (!isExpanded || isClosing) return;

    clearAnimationHandles();
    setIsClosing(true);
    setMountReady(false);

    closeTimerRef.current = window.setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 380);
  }, [clearAnimationHandles, isClosing, isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const el = overlayRef.current;
    if (!el) return;

    // Ensure first paint is off-screen before transitioning in
    setMountReady(false);
    void el.getBoundingClientRect();

    raf1Ref.current = requestAnimationFrame(() => {
      raf2Ref.current = requestAnimationFrame(() => {
        setMountReady(true);
        raf2Ref.current = null;
      });
      raf1Ref.current = null;
    });

    return () => {
      if (raf1Ref.current !== null) {
        cancelAnimationFrame(raf1Ref.current);
        raf1Ref.current = null;
      }
      if (raf2Ref.current !== null) {
        cancelAnimationFrame(raf2Ref.current);
        raf2Ref.current = null;
      }
    };
  }, [isExpanded]);

  useEffect(() => {
    clearAnimationHandles();
    setIsExpanded(false);
    setIsClosing(false);
    setMountReady(false);
  }, [entityId, clearAnimationHandles]);

  useEffect(() => {
    return () => {
      clearAnimationHandles();
    };
  }, [clearAnimationHandles]);

  const getOverlayStyle = useCallback((): React.CSSProperties => {
    const isOpen = mountReady && !isClosing;
    return {
      top: '56px',
      bottom: '92px',
      left: '12px',
      right: '12px',
      borderRadius: '48px',
      transform: isOpen ? 'translate3d(0,0,0)' : 'translate3d(120%,0,0)',
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transition: 'transform 0.38s cubic-bezier(0.2, 0.8, 0.2, 1)',
    };
  }, [mountReady, isClosing]);

  // Slide card image/node immediately on open; always reset on close.
  const getCardSlideStyle = useCallback((): React.CSSProperties => {
    const isOpen = isExpanded && !isClosing;
    return {
      transform: isOpen ? 'translate3d(-30%,0,0)' : 'translate3d(0,0,0)',
      opacity: isOpen ? 0.4 : 1,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transition: 'transform 0.38s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.34s ease',
    };
  }, [isExpanded, isClosing]);

  const getContentStyle = useCallback((): React.CSSProperties => {
    const isVisible = mountReady && !isClosing;
    return {
      opacity: isVisible ? 1 : 0,
      transition: isVisible ? 'opacity 0.2s ease 0.06s' : 'opacity 0.12s ease',
    };
  }, [mountReady, isClosing]);

  return {
    nodeRef,
    isExpanded,
    isClosing,
    openNode,
    closeNode,
    setOverlayRef,
    getOverlayStyle,
    getCardSlideStyle,
    getContentStyle,
  };
}

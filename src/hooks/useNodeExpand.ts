import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function useNodeExpand(entityId: string) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mountReady, setMountReady] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const openRafRef = useRef<number | null>(null);

  const openNode = useCallback(() => {
    setIsExpanded(true);
    setIsClosing(false);
    setMountReady(false);
  }, []);

  // Called by the overlay div's ref — forces layout read then triggers animation
  const setOverlayRef = useCallback((el: HTMLDivElement | null) => {
    overlayRef.current = el;
    if (el) {
      // Force browser to paint the off-screen position first
      void el.getBoundingClientRect();
      requestAnimationFrame(() => {
        setMountReady(true);
      });
    }
  }, []);

  const closeNode = useCallback(() => {
    if (!isExpanded || isClosing) return;
    setIsClosing(true);
    setMountReady(false);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
    }, 380);
  }, [isExpanded, isClosing]);

  useLayoutEffect(() => {
    if (openRafRef.current !== null) {
      cancelAnimationFrame(openRafRef.current);
      openRafRef.current = null;
    }

    if (!isExpanded) {
      setMountReady(false);
      return;
    }

    const el = overlayRef.current;
    if (!el) return;

    // Ensure first paint is off-screen before transitioning in
    setMountReady(false);
    void el.getBoundingClientRect();

    openRafRef.current = requestAnimationFrame(() => {
      openRafRef.current = requestAnimationFrame(() => {
        setMountReady(true);
        openRafRef.current = null;
      });
    });

    return () => {
      if (openRafRef.current !== null) {
        cancelAnimationFrame(openRafRef.current);
        openRafRef.current = null;
      }
    };
  }, [isExpanded]);

  useEffect(() => {
    setIsExpanded(false);
    setIsClosing(false);
    setMountReady(false);
  }, [entityId]);

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

  // Style for the card image/node to slide left when overlay opens
  const getCardSlideStyle = useCallback((): React.CSSProperties => {
    const isOpen = isExpanded && mountReady && !isClosing;
    return {
      transform: isOpen ? 'translate3d(-30%,0,0)' : 'translate3d(0,0,0)',
      opacity: isOpen ? 0.4 : 1,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transition: 'transform 0.38s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.34s ease',
    };
  }, [isExpanded, mountReady, isClosing]);

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

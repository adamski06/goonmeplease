import { useRef, useState, useCallback, useEffect } from 'react';

export function useNodeExpand(entityId: string) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mountReady, setMountReady] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);

  const openNode = useCallback(() => {
    setIsExpanded(true);
    setIsClosing(false);
    setMountReady(false);
    // Mount off-screen first, then slide in on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMountReady(true);
      });
    });
  }, []);

  const closeNode = useCallback(() => {
    if (!isExpanded || isClosing) return;
    setIsClosing(true);
    setMountReady(false);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
    }, 300);
  }, [isExpanded, isClosing]);

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
      transform: isOpen ? 'translateX(0)' : 'translateX(105%)',
      willChange: 'transform',
      transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
    };
  }, [mountReady, isClosing]);

  const getContentStyle = useCallback((): React.CSSProperties => {
    return { opacity: 1 };
  }, []);

  return {
    nodeRef,
    isExpanded,
    isClosing,
    openNode,
    closeNode,
    getOverlayStyle,
    getContentStyle,
  };
}

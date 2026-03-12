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
      transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
    };
  }, [mountReady, isClosing]);

  // Style for the card image/node to slide left when overlay opens
  const getCardSlideStyle = useCallback((): React.CSSProperties => {
    const isOpen = mountReady && !isClosing;
    return {
      transform: isOpen ? 'translateX(-30%)' : 'translateX(0)',
      opacity: isOpen ? 0.4 : 1,
      transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease',
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
    getCardSlideStyle,
    getContentStyle,
  };
}

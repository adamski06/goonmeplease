import { useRef, useState, useCallback, useEffect } from 'react';

interface TransformState {
  scaleX: number;
  scaleY: number;
  originX: number;
  originY: number;
}

export function useNodeExpand(entityId: string) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [expandReady, setExpandReady] = useState(false);
  const [initTransform, setInitTransform] = useState<TransformState>({
    scaleX: 0.5,
    scaleY: 0.3,
    originX: 50,
    originY: 100,
  });

  const nodeRef = useRef<HTMLDivElement>(null);

  const getTransformState = useCallback((): TransformState => {
    if (!nodeRef.current) {
      return { scaleX: 0.5, scaleY: 0.3, originX: 50, originY: 100 };
    }
    const rect = nodeRef.current.getBoundingClientRect();
    const overlayTop = 56;
    const overlayLeft = 12;
    const overlayW = window.innerWidth - 24;
    const overlayH = window.innerHeight - 148;

    const scaleX = rect.width / overlayW;
    const scaleY = rect.height / overlayH;

    // Transform origin: center of node relative to overlay bounds, as percentage
    const originX = ((rect.left + rect.width / 2 - overlayLeft) / overlayW) * 100;
    const originY = ((rect.top + rect.height / 2 - overlayTop) / overlayH) * 100;

    return { scaleX, scaleY, originX, originY };
  }, []);

  const openNode = useCallback(() => {
    const ts = getTransformState();
    setInitTransform(ts);
    setIsExpanded(true);
    setExpandReady(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpandReady(true);
      });
    });
  }, [getTransformState]);

  const closeNode = useCallback(() => {
    if (!isExpanded || isClosing) return;
    const ts = getTransformState();
    setInitTransform(ts);
    setExpandReady(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
    }, 320);
  }, [isExpanded, isClosing, getTransformState]);

  useEffect(() => {
    setIsExpanded(false);
    setIsClosing(false);
    setExpandReady(false);
  }, [entityId]);

  const getOverlayStyle = useCallback((): React.CSSProperties => {
    const { scaleX, scaleY, originX, originY } = initTransform;
    const isAnimatedOpen = expandReady && !isClosing;

    return {
      top: '56px',
      bottom: '92px',
      left: '12px',
      right: '12px',
      transformOrigin: `${originX}% ${originY}%`,
      transform: isAnimatedOpen ? 'scale(1)' : `scale(${scaleX}, ${scaleY})`,
      opacity: isAnimatedOpen ? 1 : 0,
      borderRadius: '48px',
      willChange: 'transform, opacity',
      transition: isAnimatedOpen
        ? 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.18s ease-out'
        : 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.15s ease-in',
    };
  }, [initTransform, expandReady, isClosing]);

  const getContentStyle = useCallback((): React.CSSProperties => {
    const isVisible = expandReady && !isClosing;
    return {
      opacity: isVisible ? 1 : 0,
      transition: isVisible ? 'opacity 0.15s ease-out 0.08s' : 'opacity 0.1s ease-out',
    };
  }, [expandReady, isClosing]);

  return {
    nodeRef,
    isExpanded,
    isClosing,
    expandReady,
    openNode,
    closeNode,
    getOverlayStyle,
    getContentStyle,
  };
}

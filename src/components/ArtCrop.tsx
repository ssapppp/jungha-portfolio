import React, { useLayoutEffect, useRef, useState } from 'react';
import { ART_SHEET_URL, getPrintCrop, PRINTS, SHEET_H, SHEET_W } from '../data/prints';

interface ArtCropProps {
  printIndex: number;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export const ArtCrop: React.FC<ArtCropProps> = ({
  printIndex,
  className = '',
  style,
  ariaLabel,
}) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [cropStyle, setCropStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    const customImage = PRINTS[printIndex]?.customImage;
    const customImageFit = PRINTS[printIndex]?.customImageFit ?? 'cover';
    const customImageBg = PRINTS[printIndex]?.customImageBg ?? '#ffffff';
    const customImagePosX = PRINTS[printIndex]?.customImagePosX ?? 0.5;
    if (customImage) {
      setCropStyle({
        backgroundImage: `url("${customImage}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: customImageFit,
        backgroundPosition: `${customImagePosX * 100}% center`,
        backgroundColor: customImageFit === 'contain' ? customImageBg : undefined,
      });
      return;
    }

    const el = elRef.current;
    if (!el) return;

    const crop = getPrintCrop(printIndex);

    const update = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (W <= 0 || H <= 0) return;

      const sx = W / crop.w;
      const sy = H / crop.h;

      setCropStyle({
        backgroundImage: `url("${ART_SHEET_URL}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${SHEET_W * sx}px ${SHEET_H * sy}px`,
        backgroundPosition: `${-crop.x * sx}px ${-crop.y * sy}px`,
      });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [printIndex]);

  return (
    <div
      ref={elRef}
      className={className}
      style={{ ...cropStyle, ...style }}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    />
  );
};

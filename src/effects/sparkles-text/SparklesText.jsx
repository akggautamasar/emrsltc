import React, {useEffect, useState} from 'react';
import './sparkles-text.css';

/**
 * Reusable sparkle-text enhancement for the EMRS Vite/React site.
 *
 * Adapted from the supplied motion/react + TypeScript example, without
 * introducing Motion, a Tailwind utility helper, or browser-wide timers.
 * Animations use compositor-friendly CSS transforms/opacity and automatically
 * stop when the visitor requests reduced motion.
 */
const DEFAULT_COLORS = { first: '#6de8ec', second: '#b7d7ff' };
const STAR_PATH = 'M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z';

function Sparkle({ star }) {
  return <svg
    aria-hidden="true"
    focusable="false"
    className="sparkles-text__sparkle"
    viewBox="0 0 21 21"
    width="21"
    height="21"
    style={{
      left: star.x,
      top: star.y,
      fill: star.color,
      '--sparkle-scale': star.scale,
      '--sparkle-delay': star.delay,
      '--sparkle-duration': star.duration
    }}>
    <path d={STAR_PATH}/>
  </svg>;
}

export function SparklesText({
  children,
  colors = DEFAULT_COLORS,
  className = '',
  sparklesCount = 8,
  as: Tag = 'span'
}) {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // This component decorates static headings only. Do not introduce an
    // interval that re-renders the entire heading ten times each second.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setSparkles([]);
      return;
    }
    const count = Math.min(20, Math.max(0, Math.trunc(Number(sparklesCount) || 0)));
    const stars = Array.from({length:count}, (_,id) => ({
      id,
      x: (5 + Math.random() * 90).toFixed(2) + '%',
      y: (8 + Math.random() * 82).toFixed(2) + '%',
      color: id % 2 ? colors.second : colors.first,
      scale: (0.55 + Math.random() * 0.6).toFixed(2),
      delay: (-Math.random() * 4).toFixed(2) + 's',
      duration: (2.7 + Math.random() * 1.8).toFixed(2) + 's'
    }));
    setSparkles(stars);
  }, [sparklesCount, colors.first, colors.second]);

  return <Tag className={'sparkles-text ' + className}>
    <span className="sparkles-text__content">{children}</span>
    {sparkles.map(star=><Sparkle key={star.id} star={star}/>)}
  </Tag>;
}

export default SparklesText;

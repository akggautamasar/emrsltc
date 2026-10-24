import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import './glass-pill.css';

/**
 * Functional, lightweight glass button. Keeps the existing dashboard CTA
 * footprint without running three fullscreen WebGL scenes in iframes.
 */
export default function GlassPill({ children, onClick, variant = 'explore', type = 'button' }) {
  return (
    <button type={type} className={`primary-btn glass-pill glass-pill--${variant}`} onClick={onClick}>
      <span className="glass-pill__orb" aria-hidden="true">
        <span className="glass-pill__nebula"/>
        <svg className="glass-pill__swirl" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="glass-pill__trail" d="M10 27C7 18 13 9 23 8c10-1 17 6 16 15-1 9-10 15-19 11-7-3-9-10-5-15 3-5 11-5 15-1 4 5 1 11-4 11-4 0-7-3-6-7" stroke="#92f5ff" strokeWidth="5.4" strokeLinecap="round"/>
          <path d="M10 27C7 18 13 9 23 8c10-1 17 6 16 15-1 9-10 15-19 11-7-3-9-10-5-15 3-5 11-5 15-1 4 5 1 11-4 11-4 0-7-3-6-7" stroke="white" strokeWidth="2.55" strokeLinecap="round"/>
          <circle cx="11" cy="14" r="1" fill="white"/>
          <circle cx="36" cy="33" r="0.9" fill="#c2f8ff"/>
          <circle cx="14" cy="37" r="0.65" fill="white"/>
        </svg>
      </span>
      <span className="glass-pill__label">{children}</span>
      <ArrowUpRight aria-hidden="true" className="glass-pill__arrow" size={15}/>
    </button>
  );
}

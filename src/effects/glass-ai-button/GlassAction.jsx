import React, { useEffect, useMemo, useRef, useState } from 'react';
import originalDocument from './glass-ai-button.original.html?raw';
import './glass-action.css';

// Keep the verified 3D renderer intact. Only the visible branding and the
// sandbox-to-parent activation bridge are adapted for EMRSLTC.
export default function GlassAction({ label, onClick, className = '' }) {
  const ref = useRef(null);
  const frame = useRef(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [ready, setReady] = useState(false);
  const documentHtml = useMemo(() => {
    const safeLabel = String(label).replace(/[<>&"']/g, '').slice(0, 36);
    const bridge = `<script>
      document.querySelector('#controls')?.remove();
      const canvas = document.querySelector('#glass');
      const observer = new MutationObserver(() => { if (canvas?.dataset.ready === 'true') { window.parent.postMessage({type:'emrs-glass-ready'}, '*'); observer.disconnect(); } });
      if (canvas) observer.observe(canvas, {attributes:true,attributeFilter:['data-ready']});
      document.addEventListener('click', function(event) {
        if (event.target.closest('#activate')) {
          window.parent.postMessage({type:'emrs-glass-activate'}, '*');
        }
      }, true);
    <\/script>`;
    return originalDocument.replaceAll('GPT 6 Sol', safeLabel).replace('</body>', bridge + '</body>');
  }, [label]);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), {rootMargin:'100px'});
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    const handle = event => {
      if (event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'emrs-glass-ready') { setReady(true); return; }
      if (event.data?.type === 'emrs-glass-activate') onClick?.();
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [onClick]);
  const mounted = visible && pageVisible;
  useEffect(() => { setReady(false); }, [mounted]);
  return <div ref={ref} className={`emrs-glass-action ${className}`} aria-label={label}>
    {mounted ? <iframe ref={frame} title={label} srcDoc={documentHtml} sandbox="allow-scripts"
      onLoad={() => {}} style={{opacity:ready?1:0}} /> : null}
    {!ready && <button className="emrs-glass-fallback" type="button" onClick={onClick}>{label}</button>}
  </div>;
}

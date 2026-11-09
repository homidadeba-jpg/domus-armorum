import React, { useEffect, useRef, useState } from 'react';
import { translations } from './translations.js';
import { company } from './company.js';
export function WhatsAppLink({ children, className = '', author = false, floating = false, copy = translations.it }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef();
  useEffect(() => {
    const reset = () => { setOpening(false); window.clearTimeout(timer.current); };
    const visible = () => { if (document.visibilityState === 'visible') reset(); };
    window.addEventListener('focus', reset);
    window.addEventListener('pageshow', reset);
    document.addEventListener('visibilitychange', visible);
    return () => { reset(); window.removeEventListener('focus', reset); window.removeEventListener('pageshow', reset); document.removeEventListener('visibilitychange', visible); };
  }, []);
  return <a className={`whatsapp-link ${className} ${opening ? 'is-opening' : ''}`} href={author ? 'https://wa.me/5585999745534' : `${company.whatsapp}?text=${encodeURIComponent(copy.greeting)}`} target="_blank" rel="noopener noreferrer" aria-label={floating ? (opening ? copy.whatsappOpening : copy.whatsappContact) : undefined} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setOpening(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpening(false), 5000);
  }}>
    <span className="wa-normal">{children}</span>
    <span className="wa-pending" aria-hidden={!opening}><span className="spinner" />{!floating && copy.whatsappOpening}</span>
    <span className="sr-only" role="status">{opening ? copy.whatsappOpening : ''}</span>
  </a>;
}

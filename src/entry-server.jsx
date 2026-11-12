import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './main.jsx';

// Reuse the real page and its current copy; no crawler-only content or second layout.
export function render() {
  return renderToString(<App initialLocale="pt" />);
}

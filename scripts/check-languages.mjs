import assert from 'node:assert/strict';
import { languages, translations, resolveLanguage, initialLanguage } from '../src/translations.js';

assert.equal(resolveLanguage(), 'it');
for (const [tag, expected] of [['it-IT', 'it'], ['en-GB', 'en'], ['es-AR', 'es'], ['pt-PT', 'pt'], ['PT_br', 'pt']]) {
  assert.equal(resolveLanguage({ preferred: [tag] }), expected);
}
assert.equal(resolveLanguage({ preferred: ['de-DE', 'es-ES', 'en-US'] }), 'es');
assert.equal(resolveLanguage({ preferred: ['de-DE', 'fr-FR'] }), 'it');
assert.equal(resolveLanguage({ saved: 'pt', preferred: ['it-IT'] }), 'pt');
assert.equal(resolveLanguage({ search: '?campaign=test&lang=en', saved: 'pt', preferred: ['it-IT'] }), 'en');
assert.equal(resolveLanguage({ search: '?lang=unknown', saved: 'unknown', preferred: ['es-MX'] }), 'es');
assert.equal(resolveLanguage({ search: '?lang=__proto__', saved: 'constructor' }), 'it');

globalThis.window = { location: { search: '' } };
globalThis.localStorage = { getItem() { throw new Error('Storage disabled'); } };
const browserPreferences = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
try {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { languages: ['es-MX'], language: 'es-MX' } });
  assert.equal(initialLanguage(), 'es');
} finally {
  if (browserPreferences) Object.defineProperty(globalThis, 'navigator', browserPreferences);
  else delete globalThis.navigator;
  delete globalThis.window;
  delete globalThis.localStorage;
}

const keys = Object.keys(translations.it).sort();
for (const { code } of languages) {
  assert.deepEqual(Object.keys(translations[code]).sort(), keys, `Missing translations: ${code}`);
  assert.ok(Object.values(translations[code]).every(value => typeof value === 'string' && value.trim()));
  assert.match(translations[code].company, /Cascavel/);
  assert.match(translations[code].description, /Cascavel, Paraná/);
  assert.doesNotMatch(JSON.stringify(translations[code]), /Gardone|Alessandro Volta|25063/);
}
console.log('Language detection, precedence, blocked storage and translation completeness passed.');

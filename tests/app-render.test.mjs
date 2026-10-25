import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {createServer} from 'vite';

// A bundler build cannot catch an undefined JSX variable such as <Search />.
// Server-render the real application to catch missing icon imports and initial
// render crashes before deploying another blank screen to users.
test('EMRS dashboard and Circular Finder routes render without React reference errors', async () => {
  const server = await createServer({
    server:{middlewareMode:true,hmr:false},
    appType:'custom',
    logLevel:'error'
  });
  const savedWindow=globalThis.window;
  const savedLocation=globalThis.location;
  try {
    const {default:App}=await server.ssrLoadModule('/src/App.jsx');
    for (const fragment of ['', 'circulars', 'ltc', 'medical', 'ta', 'cea', 'salary']) {
      globalThis.window={
        location:{hash:fragment?'#'+fragment:''},
        scrollTo:()=>{}
      };
      globalThis.location=globalThis.window.location;
      const html=renderToString(React.createElement(App));
      assert.ok(html.length>100, fragment+': output empty');
      assert.match(html,/EMRS/, fragment+': header missing');
      if (fragment==='circulars') assert.match(html,/Circular Finder/, 'finder missing');
      if (fragment==='salary') {
        assert.match(html,/Salary Review/, 'salary feature missing');
        assert.match(html,/sparkles-text/, 'salary heading sparkle missing');
      }
      if (!fragment) assert.match(html,/sparkles-text/, 'homepage headline sparkle missing');
    }
  } finally {
    if(savedWindow===undefined)delete globalThis.window;else globalThis.window=savedWindow;
    if(savedLocation===undefined)delete globalThis.location;else globalThis.location=savedLocation;
    await server.close();
  }
});

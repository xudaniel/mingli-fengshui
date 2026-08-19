// Node 22+ defines its own experimental global `localStorage` that Vitest's
// jsdom environment setup skips overriding (since the key already exists on
// `global`). Force jsdom's real localStorage/sessionStorage back onto the
// global scope so tests can use the bare `localStorage` identifier.
const win = (globalThis as unknown as { jsdom?: { window: Window } }).jsdom?.window;
if (win) {
  Object.defineProperty(globalThis, "localStorage", {
    value: win.localStorage,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    value: win.sessionStorage,
    configurable: true,
    writable: true,
  });
}

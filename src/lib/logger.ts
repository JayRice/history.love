// Minimal centralized logger for development diagnostics.
//
// Rules (Phase 0A, see docs/migration-status.md):
// - Never log auth tokens, session objects, private user data,
//   relationship or memory contents, media URLs, or personal info.
// - debug/warn are compiled to no-ops outside development.
// - error always surfaces (crash reporting attaches here later).

const noop = (..._args: unknown[]) => {};

export const logger = {
  debug: __DEV__ ? console.log.bind(console) : noop,
  warn: __DEV__ ? console.warn.bind(console) : noop,
  error: console.error.bind(console),
};

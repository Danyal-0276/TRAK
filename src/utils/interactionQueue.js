/** Serialize async work per article so rapid taps don't race the API. */
const chains = new Map();

export function enqueuePerArticle(scope, fn) {
  const key = String(scope);
  const prior = chains.get(key) || Promise.resolve();
  const run = prior.then(() => fn());
  chains.set(
    key,
    run.catch(() => {}).finally(() => {
      if (chains.get(key) === run) chains.delete(key);
    }),
  );
  return run;
}

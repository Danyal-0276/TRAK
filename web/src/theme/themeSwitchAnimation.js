import { flushSync } from 'react-dom';

/** Keep in sync with --trak-transition-duration in themeTransition.css */
export const THEME_SWITCH_MS = 1150;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function afterPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

function beginTransitioning({ useViewTransition }) {
  const root = document.documentElement;
  root.classList.add('theme-transitioning');
  if (useViewTransition) {
    root.classList.add('trak-view-transition');
  }
}

function endTransitioning() {
  const root = document.documentElement;
  root.classList.remove('theme-transitioning', 'trak-view-transition');
}

function waitForColorTransitionEnd() {
  return new Promise((resolve) => {
    const root = document.documentElement;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      root.removeEventListener('transitionend', onEnd);
      clearTimeout(fallback);
      resolve();
    };
    const onEnd = (event) => {
      if (event.target !== root) return;
      if (event.propertyName?.startsWith('--trak-')) {
        finish();
      }
    };
    root.addEventListener('transitionend', onEnd);
    const fallback = window.setTimeout(finish, THEME_SWITCH_MS + 80);
  });
}

function runCssTransition(applyTheme) {
  return afterPaint()
    .then(() => {
      flushSync(applyTheme);
      return waitForColorTransitionEnd();
    })
    .then(endTransitioning);
}

function runViewTransition(applyTheme) {
  return afterPaint().then(
    () =>
      new Promise((resolve) => {
        const transition = document.startViewTransition(() => {
          flushSync(applyTheme);
        });
        const done = () => {
          endTransitioning();
          resolve();
        };
        if (transition?.finished) {
          transition.finished.then(done).catch(done);
        } else {
          wait(THEME_SWITCH_MS).then(done);
        }
      }),
  );
}

/**
 * One synchronized theme switch: DOM vars + React state in the same flushSync,
 * then either a full-page cross-fade (View Transitions) or unified CSS transitions.
 */
export function runThemeSwitchAnimation({ applyTheme }) {
  if (prefersReducedMotion()) {
    flushSync(applyTheme);
    return Promise.resolve();
  }

  const useViewTransition = typeof document.startViewTransition === 'function';
  beginTransitioning({ useViewTransition });

  if (useViewTransition) {
    return runViewTransition(applyTheme);
  }

  return runCssTransition(applyTheme);
}

import { getStateFromPath as defaultGetStateFromPath } from '@react-navigation/native';
import { PUBLIC_WEB_ORIGIN } from '../config/publicWebOrigin';

/** Ensure deep-linked ArticleDetail has MainTabs below it so swipe-back works. */
function ensureArticleDetailStackHistory(state) {
  if (!state?.routes) return state;
  return {
    ...state,
    routes: state.routes.map((route) => {
      if (route.name !== 'NewsFeed' || !route.state?.routes?.length) return route;
      const stackRoutes = route.state.routes;
      const stackIndex = route.state.index ?? stackRoutes.length - 1;
      const focused = stackRoutes[stackIndex];
      if (focused?.name !== 'ArticleDetail') return route;
      if (stackRoutes.some((r) => r.name === 'MainTabs')) return route;
      const returnTab = focused.params?.returnTab || 'Home';
      return {
        ...route,
        state: {
          ...route.state,
          routes: [
            {
              name: 'MainTabs',
              state: {
                routes: [{ name: returnTab }],
                index: 0,
              },
            },
            focused,
          ],
          index: 1,
        },
      };
    }),
  };
}

/** React Navigation deep links — HTTPS opens app when installed, else web. */
export const navigationLinking = {
  prefixes: [PUBLIC_WEB_ORIGIN, 'https://trak-flax.vercel.app', 'trak://'],
  config: {
    screens: {
      NewsFeed: {
        screens: {
          MainTabs: {
            screens: {
              Home: 'home',
              Search: 'search',
              Chat: 'chat',
              Notifications: 'notifications',
              Profile: 'profile',
            },
          },
          ArticleDetail: {
            path: 'article/:articleId',
            parse: {
              articleId: (id) => String(id || ''),
            },
          },
        },
      },
    },
  },
  getStateFromPath(path, options) {
    const state = defaultGetStateFromPath(path, options);
    return ensureArticleDetailStackHistory(state);
  },
};

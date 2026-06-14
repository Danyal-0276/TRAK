import { PUBLIC_WEB_ORIGIN } from '../config/publicWebOrigin';

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
              Notifications: 'notifications',
              Profile: 'profile',
              Chat: 'chat',
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
};

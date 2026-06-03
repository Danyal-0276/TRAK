import React, { useCallback, useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import CustomTabBar from './components/CustomTabBar.jsx';
import { TabPagerContext } from './TabPagerContext';
import {
  NewsFeedScreen,
  NotificationsScreen,
  ProfileScreen,
  SearchScreen,
  ChatScreen,
  AdminScreen,
} from './config/screenImports';

const TAB_COMPONENTS = {
  Home: NewsFeedScreen,
  Search: SearchScreen,
  Notifications: NotificationsScreen,
  Profile: ProfileScreen,
  Chat: ChatScreen,
  Admin: AdminScreen,
};

function buildRoutes(isAdmin) {
  if (isAdmin) {
    return [{ key: 'Admin', title: 'Admin' }];
  }
  return [
    { key: 'Home', title: 'Home' },
    { key: 'Search', title: 'Search' },
    { key: 'Notifications', title: 'Notifications' },
    { key: 'Profile', title: 'Profile' },
    { key: 'Chat', title: 'Chat' },
  ];
}

export default function SwipeableMainTabs() {
  const navigation = useNavigation();
  const { isAdmin } = useAuth();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const routes = useMemo(() => buildRoutes(isAdmin), [isAdmin]);

  const jumpToTab = useCallback(
    (name) => {
      const i = routes.findIndex((r) => r.key === name);
      if (i >= 0) setIndex(i);
    },
    [routes]
  );

  navigation.__tabPagerJump = jumpToTab;

  const tabBarProps = useMemo(() => {
    const state = {
      index,
      routes: routes.map((r) => ({ key: r.key, name: r.key, params: undefined })),
    };
    return {
      state,
      navigation: {
        navigate: (name) => jumpToTab(name),
        emit: () => ({ defaultPrevented: false }),
      },
      descriptors: Object.fromEntries(
        routes.map((r) => [r.key, { options: { title: r.title } }])
      ),
    };
  }, [index, routes, jumpToTab]);

  const renderScene = useCallback(
    ({ route }) => {
      const Component = TAB_COMPONENTS[route.key];
      if (!Component) return null;
      return (
        <View style={{ flex: 1 }}>
          <Component navigation={navigation} route={{ name: route.key, key: route.key }} />
        </View>
      );
    },
    [navigation]
  );

  return (
    <TabPagerContext.Provider value={{ jumpToTab, index, routes }}>
      <View style={{ flex: 1 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={() => null}
          swipeEnabled
          animationEnabled
          lazy
          removeClippedSubviews
        />
        {!isAdmin ? <CustomTabBar {...tabBarProps} /> : null}
      </View>
    </TabPagerContext.Provider>
  );
}

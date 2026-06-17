import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveTopInset } from '../../utils/screenSafeArea';
import { useTheme } from '../../theme/ThemeContext';
import { getRefreshControlProps } from '../../theme/refreshControl';
import { loadPicsPage } from '../../utils/loadFeed';
import ArticleCardImage from '../../components/ArticleCardImage';
import { resolveArticleImageUrl } from '../../utils/articleMedia';
import Text from '../../components/ui/Text';
import { navigateToArticleDetail, getCurrentMainTab } from '../../utils/articleNavigation';
import { useStackBackHandler } from '../../hooks/useStackBackHandler';

const GAP = 10;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (Dimensions.get('window').width - 24 - GAP) / NUM_COLUMNS;

const PicsScreen = ({ navigation }) => {
    useStackBackHandler(navigation, true);
    const { theme } = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const topInset = resolveTopInset(insets, 0);
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadNews = useCallback(async () => {
        try {
            const page = await loadPicsPage({ limit: 30, cursor: '' });
            setNewsData(page.items || []);
            setNextCursor(page.nextCursor || null);
            setHasMore(Boolean(page.hasMore));
        } catch (e) {
            console.warn(e);
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await loadPicsPage({ limit: 30, cursor: nextCursor });
            setNewsData((prev) => {
                const seen = new Set(prev.map((x) => String(x.id)));
                const merged = [...prev];
                for (const item of page.items || []) {
                    const id = String(item.id);
                    if (seen.has(id)) continue;
                    seen.add(id);
                    merged.push(item);
                }
                return merged;
            });
            setNextCursor(page.nextCursor || null);
            setHasMore(Boolean(page.hasMore));
        } catch (e) {
            console.warn(e);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, nextCursor]);

    const handleArticlePress = (article) => {
        navigateToArticleDetail(navigation, article, { returnTab: getCurrentMainTab(navigation) });
    };

    const renderItem = ({ item }) => {
        const imageUrl = resolveArticleImageUrl(item);
        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                activeOpacity={0.85}
                onPress={() => handleArticlePress(item)}
            >
                {imageUrl ? (
                    <ArticleCardImage
                        src={imageUrl}
                        alt={item.title || 'Article'}
                        height={CARD_WIDTH * 0.72}
                        borderRadius={0}
                        backgroundColor={colors.borderLight}
                    />
                ) : (
                    <View style={[styles.image, { backgroundColor: colors.borderLight }]} />
                )}
                <Text variant="body" numberOfLines={3} style={[styles.title, { color: colors.textPrimary }]}>
                    {item.title || 'Untitled'}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: topInset }]}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { borderBottomColor: colors.borderLight, backgroundColor: colors.surface }]}>
                <View style={styles.headerText}>
                    <Text variant="title" style={{ color: colors.textPrimary }}>
                        Pics
                    </Text>
                    <Text variant="caption" color={colors.textSecondary}>
                        Visual stories with hero images
                    </Text>
                </View>
            </View>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : (
                <FlatList
                    data={newsData}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={NUM_COLUMNS}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={async () => {
                                setRefreshing(true);
                                await loadNews();
                                setRefreshing(false);
                            }}
                            {...getRefreshControlProps(colors, theme.mode)}
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.4}
                    ListEmptyComponent={
                        <Text variant="body" color={colors.textSecondary} style={styles.empty}>
                            No image stories available right now.
                        </Text>
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
                        ) : null
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerText: { flex: 1 },
    list: { paddingHorizontal: 12, paddingBottom: 120, paddingTop: 12 },
    row: { gap: GAP, marginBottom: GAP },
    card: {
        width: CARD_WIDTH,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
    },
    image: {
        width: '100%',
        height: CARD_WIDTH * 0.72,
    },
    title: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { textAlign: 'center', marginTop: 48, paddingHorizontal: 24 },
});

export default PicsScreen;

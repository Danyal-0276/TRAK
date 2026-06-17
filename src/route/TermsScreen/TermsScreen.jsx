import React from 'react';
import { ScrollView, View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import Text from '../../components/ui/Text';
import { useStackBackHandler } from '../../hooks/useStackBackHandler';

const Section = ({ title, children, colors }) => (
    <View style={styles.section}>
        <Text variant="subtitle" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {title}
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.para}>
            {children}
        </Text>
    </View>
);

const TermsScreen = () => {
    const navigation = useNavigation();
    useStackBackHandler(navigation, true);
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
                <Text variant="title" style={{ color: colors.textPrimary }}>
                    Terms of Service
                </Text>
            </View>
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingHorizontal: theme.spacing.md }]}
                showsVerticalScrollIndicator={false}
            >
                <Text variant="caption" color={colors.textSecondary} style={styles.updated}>
                    Last updated:{' '}
                    {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Text>

                <Section title="1. Acceptance of Terms" colors={colors}>
                    By accessing or using TRAK, you agree to these terms. If you do not agree, do not use
                    the service.
                </Section>
                <Section title="2. Use of the service" colors={colors}>
                    You agree to use TRAK only for lawful purposes. You are responsible for the accuracy
                    of information you provide and for keeping your account credentials secure.
                </Section>
                <Section title="3. Content" colors={colors}>
                    News summaries, scores, and metadata are provided for informational purposes. TRAK does
                    not guarantee completeness or accuracy of third-party sources.
                </Section>
                <Section title="4. Privacy" colors={colors}>
                    Our collection and use of personal data is described in the Privacy & Security screen.
                    By using TRAK you consent to those practices.
                </Section>
                <Section title="5. Changes" colors={colors}>
                    We may update these terms from time to time. Continued use after changes constitutes
                    acceptance of the revised terms.
                </Section>
                <View style={{ height: 48 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    scroll: { paddingTop: 16, paddingBottom: 32 },
    updated: { marginBottom: 24 },
    section: { marginBottom: 28 },
    sectionTitle: { marginBottom: 8, fontWeight: '600' },
    para: { lineHeight: 22 },
});

export default TermsScreen;

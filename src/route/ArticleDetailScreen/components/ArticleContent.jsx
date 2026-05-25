
// ============================================
// FILE: components/ArticleContent.jsx
// ============================================
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import TextComponent from '../../../components/ui/Text';
import { splitArticleParagraphs } from '../../../utils/articleParagraphs';

const SCROLL_OFFSET_ABOVE_LINE = 120;

export const ArticleContent = ({
  category,
  title,
  content,
  highlightLines = [],
  activeLineIndex = -1,
  scrollRef,
  scrollContentRef,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = colors.primary || '#3b82f6';
  const lineRefs = useRef({});

  const paragraphs = splitArticleParagraphs(content);
  const useKaraoke = highlightLines.length > 0;

  useEffect(() => {
    if (activeLineIndex < 0 || !scrollRef?.current || !scrollContentRef?.current) return;
    const lineView = lineRefs.current[activeLineIndex];
    if (!lineView) return;
    lineView.measureLayout(
      scrollContentRef.current,
      (_x, y) => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - SCROLL_OFFSET_ABOVE_LINE),
          animated: true,
        });
      },
      () => {}
    );
  }, [activeLineIndex, scrollRef, scrollContentRef]);

  const lineStyle = (globalIdx) => {
    if (activeLineIndex < 0) {
      return { color: colors.textSecondary };
    }
    if (globalIdx === activeLineIndex) {
      return {
        color: colors.textPrimary,
        backgroundColor: `${primary}22`,
        fontWeight: '600',
      };
    }
    if (globalIdx < activeLineIndex) {
      return { color: colors.textSecondary, opacity: 0.72 };
    }
    return { color: colors.textSecondary, opacity: 0.92 };
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.categoryBadge,
          {
            backgroundColor: colors.primary + '15',
            borderLeftColor: colors.primary,
          },
        ]}
      >
        <Text style={[styles.categoryText, { color: colors.primary }]}>{category}</Text>
      </View>

      <TextComponent variant="title" style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </TextComponent>

      <View style={styles.contentBlocks} collapsable={false}>
        {useKaraoke
          ? highlightLines.map((line, globalIdx) => {
              const prevPi =
                globalIdx > 0 ? highlightLines[globalIdx - 1].paragraphIndex : line.paragraphIndex;
              const newParagraph =
                globalIdx > 0 && line.paragraphIndex !== prevPi;
              return (
                <View
                  key={`line-${globalIdx}`}
                  ref={(node) => {
                    if (node) lineRefs.current[globalIdx] = node;
                  }}
                  collapsable={false}
                  style={[styles.karaokeLineWrap, newParagraph ? styles.paragraphGap : null]}
                >
                  <TextComponent
                    variant="body"
                    style={[styles.content, styles.karaokeLine, lineStyle(globalIdx)]}
                  >
                    {line.text}
                  </TextComponent>
                </View>
              );
            })
          : paragraphs.map((paragraph, index) => (
              <TextComponent
                key={`p-${index}`}
                variant="body"
                style={[styles.content, { color: colors.textSecondary }]}
              >
                {paragraph}
              </TextComponent>
            ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  contentBlocks: {},
  paragraphGap: {
    marginTop: 14,
  },
  content: {
    fontSize: 17,
    lineHeight: 30,
    fontWeight: '400',
    marginBottom: 10,
  },
  karaokeLineWrap: {
    marginBottom: 2,
  },
  karaokeLine: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});

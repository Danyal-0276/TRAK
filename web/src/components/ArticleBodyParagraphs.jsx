import React, { useEffect, useRef } from 'react';
import { splitArticleParagraphs } from '../utils/articleParagraphs';

export function ArticleBodyParagraphs({
  content,
  style,
  paragraphStyle,
  highlightLines = [],
  activeLineIndex = -1,
  highlightColor = '#3b82f6',
}) {
  const lineRefs = useRef({});
  const paragraphs = splitArticleParagraphs(content);
  const useKaraoke = highlightLines.length > 0;

  useEffect(() => {
    if (activeLineIndex < 0) return;
    const el = lineRefs.current[activeLineIndex];
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }, [activeLineIndex]);

  const lineCss = (globalIdx) => {
    const base = {
      margin: '0 0 10px 0',
      scrollMarginTop: '100px',
      scrollMarginBottom: '40vh',
      ...paragraphStyle,
    };
    if (activeLineIndex < 0) return base;
    if (globalIdx === activeLineIndex) {
      return {
        ...base,
        backgroundColor: `${highlightColor}22`,
        color: '#0f172a',
        fontWeight: 600,
        borderRadius: 6,
        padding: '4px 8px',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      };
    }
    if (globalIdx < activeLineIndex) {
      return { ...base, opacity: 0.72 };
    }
    return { ...base, opacity: 0.92 };
  };

  if (!useKaraoke) {
    if (!paragraphs.length) {
      return <p style={paragraphStyle}>Article content goes here...</p>;
    }
    return (
      <div style={style}>
        {paragraphs.map((paragraph, index) => (
          <p key={index} style={{ margin: '0 0 16px 0', ...paragraphStyle }}>
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div style={style}>
      {highlightLines.map((line, globalIdx) => {
        const prevPi =
          globalIdx > 0 ? highlightLines[globalIdx - 1].paragraphIndex : line.paragraphIndex;
        const newParagraph = globalIdx > 0 && line.paragraphIndex !== prevPi;
        return (
          <p
            key={`line-${globalIdx}`}
            ref={(el) => {
              if (el) lineRefs.current[globalIdx] = el;
            }}
            style={{
              ...lineCss(globalIdx),
              ...(newParagraph ? { marginTop: '18px' } : null),
            }}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
}

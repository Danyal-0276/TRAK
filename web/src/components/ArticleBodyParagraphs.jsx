import React from 'react';
import { splitArticleParagraphs } from '../utils/articleParagraphs';

export function ArticleBodyParagraphs({ content, style, paragraphStyle }) {
  const paragraphs = splitArticleParagraphs(content);
  if (!paragraphs.length) {
    return <p style={paragraphStyle}>Article content goes here...</p>;
  }
  return (
    <div style={style}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          style={{
            margin: '0 0 16px 0',
            ...paragraphStyle,
          }}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

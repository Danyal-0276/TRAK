import React, { useMemo, useState } from 'react';
import {
  getMaterialIconColor,
  getMaterialIconGlyph,
  getNotificationCardContent,
  getSourceFaviconUrl,
} from '../../utils/notificationCardContent';
import {
  getNotificationSourceInitial,
  isArticleKeywordNotification,
} from '../../utils/notificationDisplay';

function NotificationAvatar({ notification, size = 46, colors }) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const faviconUrl = getSourceFaviconUrl(notification);
  const isKeyword = isArticleKeywordNotification(notification);
  const useFavicon = Boolean(faviconUrl) && !faviconFailed && isKeyword;

  if (useFavicon) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surfaceElevated || colors.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src={faviconUrl}
          alt=""
          width={Math.round(size * 0.58)}
          height={Math.round(size * 0.58)}
          style={{ objectFit: 'contain' }}
          onError={() => setFaviconFailed(true)}
        />
      </div>
    );
  }

  if (isKeyword) {
    const initial = getNotificationSourceInitial(notification);
    const tint = getMaterialIconColor(notification?.type || 'keyword_match');
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: `${tint}14`,
          border: `1px solid ${tint}28`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: Math.round(size * 0.36),
          fontWeight: 700,
          color: tint,
        }}
      >
        {initial}
      </div>
    );
  }

  const glyph = getMaterialIconGlyph(notification?.type);
  const tint = getMaterialIconColor(notification?.type);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: `${tint}14`,
        border: `1px solid ${tint}28`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'Material Icons',
        fontSize: Math.round(size * 0.46),
        color: tint,
        lineHeight: 1,
      }}
      aria-hidden
    >
      {glyph}
    </div>
  );
}

export default function NotificationCard({ notification, colors, isDark, onClick }) {
  const [hovered, setHovered] = useState(false);
  const content = useMemo(() => getNotificationCardContent(notification), [notification]);
  const isUnread = !notification.read;

  const backgroundColor = hovered
    ? colors.surfaceHover
    : isUnread
      ? `${colors.primary}07`
      : colors.background;

  return (
    <button
        type="button"
        onClick={() => onClick?.(notification)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          width: '100%',
          padding: '14px 16px',
          margin: 0,
          border: 'none',
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor,
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
          transition: 'background-color 0.15s ease',
        }}
      >
        <NotificationAvatar notification={notification} colors={colors} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minWidth: 0,
                flex: 1,
              }}
            >
              {isUnread ? (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: colors.primary,
                    flexShrink: 0,
                  }}
                />
              ) : null}
              {content.headlinePrefix ? (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: colors.primary,
                  }}
                >
                  {content.headlinePrefix}
                </span>
              ) : null}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isUnread ? colors.textPrimary : colors.textSecondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                }}
              >
                {content.headline}
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: colors.textTertiary,
                flexShrink: 0,
              }}
            >
              {content.time}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.4,
              fontWeight: isUnread ? 700 : 600,
              color: colors.textPrimary,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {content.title}
          </p>

          {content.meta ? (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 12,
                fontWeight: 500,
                color: colors.textTertiary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {content.meta}
            </p>
          ) : null}
        </div>
      </button>
  );
}

export { NotificationAvatar };

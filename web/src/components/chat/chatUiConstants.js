export const CHAT_PROMPTS = [
  {
    label: 'Trending now',
    hint: 'Headlines people are reading',
    prompt: "What's trending today?",
  },
  {
    label: 'Tech digest',
    hint: 'Latest technology stories',
    prompt: 'Summarize top tech news',
  },
  {
    label: 'Sports update',
    hint: 'Scores, transfers & highlights',
    prompt: 'Latest sports headlines',
  },
  {
    label: 'Economy watch',
    hint: 'Markets, policy & business',
    prompt: 'News about the economy',
  },
];

export const CHAT_HERO_TITLE = 'How can I help you today?';
export const CHAT_HERO_SUBTITLE = 'Ask TRAK AI about headlines, topics, or stories in your feed.';

export const CHAT_ANIMATION_CSS = `
  @keyframes chatPanelIn {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes chatMsgIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes chatHeroIn {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes typingBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes fabPulse {
    0%, 100% { transform: scale(1); box-shadow: 0 8px 28px rgba(0,0,0,0.18); }
    50% { transform: scale(1.03); box-shadow: 0 12px 32px rgba(0,0,0,0.22); }
  }
`;

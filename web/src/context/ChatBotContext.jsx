import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ChatBotContext = createContext(null);

export function ChatBotProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const openChat = useCallback(() => {
    setOpen(true);
    setHasUnread(false);
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setOpen((prev) => {
      if (!prev) setHasUnread(false);
      return !prev;
    });
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      hasUnread,
      setHasUnread,
      openChat,
      closeChat,
      toggleChat,
    }),
    [open, hasUnread, openChat, closeChat, toggleChat],
  );

  return <ChatBotContext.Provider value={value}>{children}</ChatBotContext.Provider>;
}

export function useChatBot() {
  const ctx = useContext(ChatBotContext);
  if (!ctx) {
    throw new Error('useChatBot must be used within ChatBotProvider');
  }
  return ctx;
}

import React from "react";
import {
  Bell, Heart, MessageCircle, UserPlus, AtSign, Repeat, Smartphone, Flame
} from "lucide-react-native";

export const getIcon = (type, keyword) => {
  if (type === "keyword" && keyword === "Mobile") return <Smartphone size={22} color="#2563EB" />;
  if (type === "keyword" && keyword === "SNGPL") return <Flame size={22} color="#F97316" />;
  switch (type) {
    case "like": return <Heart size={22} color="#E0245E" />;
    case "comment": return <MessageCircle size={22} color="#1DA1F2" />;
    case "follow": return <UserPlus size={22} color="#17BF63" />;
    case "mention": return <AtSign size={22} color="#F59E0B" />;
    case "retweet": return <Repeat size={22} color="#0EA5E9" />;
    default: return <Bell size={22} color="#9CA3AF" />;
  }
};

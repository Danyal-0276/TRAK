// components/profile/BookmarkList.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BookMarked } from "lucide-react-native";

const BookmarkList = ({ bookmarks }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Reports (Bookmarks)</Text>
      {bookmarks.map((item) => (
        <View key={item.id} style={styles.postCard}>
          <BookMarked size={18} color="#000" style={{ marginBottom: 6 }} />
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postSummary}>{item.summary}</Text>
          <Text style={styles.postDate}>{item.date}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  postSummary: { fontSize: 14, color: "#333", marginBottom: 6 },
  postDate: { fontSize: 12, color: "#657786" },
});

export default BookmarkList;

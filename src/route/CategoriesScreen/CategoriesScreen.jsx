import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([
    "Technology",
    "Health",
    "Finance",
    "Education",
    "Sports",
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
      setShowSuccess(true);
    }
  };

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setShowConfirm(true);
  };

  const handleDelete = () => {
    setCategories(categories.filter((c) => c !== categoryToDelete));
    setCategoryToDelete(null);
    setShowConfirm(false);
    setShowSuccess(true);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Categories</Text>
      <Text style={styles.text}>
        Customize the categories you want to follow for personalized updates.
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter new category"
          value={newCategory}
          onChangeText={setNewCategory}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addCategory}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {categories.map((cat, idx) => (
        <View key={idx} style={styles.categoryBox}>
          <Text style={styles.category}>{cat}</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete(cat)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>Back</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Delete Category</Text>
            <Text style={styles.alertMessage}>
              Are you sure you want to delete "{categoryToDelete}"?
            </Text>

            <View style={styles.alertBtns}>
              <TouchableOpacity
                style={[styles.alertBtn, { backgroundColor: "#555" }]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.alertBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.alertBtn, { backgroundColor: "red" }]}
                onPress={handleDelete}
              >
                <Text style={styles.alertBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal (auto-close + tap to close) */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSuccess(false)}>
          <View style={styles.overlay}>
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>Success</Text>
              <Text style={styles.alertMessage}>
                Action completed successfully!
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#000" },
  text: { fontSize: 16, color: "#555", marginBottom: 20 },
  inputRow: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: "#f9f9f9",
  },
  addBtn: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
  categoryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  category: { fontSize: 16, color: "#000" },
  deleteBtn: {
    backgroundColor: "red",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteBtnText: { color: "#fff", fontWeight: "bold" },
  btn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  alertMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  alertBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  alertBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  alertBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CategoriesScreen;

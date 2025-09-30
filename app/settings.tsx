import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import FooterNavigation from "./components/FooterNavigation";
import { useAuth } from "./contexts/UserContext";
import apiClient from "./utils/apiClient";
import { Ionicons } from "@expo/vector-icons";

const SettingsPage = () => {
  const { user, token, logout } = useAuth();
  const [me, setMe] = useState<any>(user);
  const [nickname, setNickname] = useState((user as any)?.nickname || "");
  const [schoolModal, setSchoolModal] = useState(false);
  const [parentModal, setParentModal] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        const res = await apiClient.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMe(res.data);
        if (res.data?.nickname) setNickname(res.data.nickname);
      } catch {}
    })();
  }, [token]);
  const nicknameLocked = Boolean(me?.nickname);
  const uniqueCode = useMemo(
    () => (me?._id ? me._id.slice(-6).toUpperCase() : "------"),
    [me?._id]
  );
  const [schoolCode, setSchoolCode] = useState("");
  const [parentCode, setParentCode] = useState("");

  const isLinkedToSchool = Boolean(me?.school || me?.schoolId);
  const isLinkedToParent = Boolean(me?.parent || me?.parentId);

  const saveNickname = async () => {
    if (!token) return;
    await apiClient.patch(
      "/api/users/me",
      { nickname },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const linkSchool = async () => {
    if (!token || !schoolCode) return;
    await apiClient.post(
      "/api/users/link-school",
      { code: schoolCode },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const res = await apiClient.get("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMe(res.data);
  };

  const linkParent = async () => {
    if (!token || !parentCode) return;
    await apiClient.post(
      "/api/users/link-parent",
      { code: parentCode },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const res = await apiClient.get("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMe(res.data);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {me?.avatarUrl ? (
              <Image source={{ uri: me.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(
                    (me?.fullName || "ST")
                      .split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2) || "ST"
                  ).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.uploadBtn}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nameText}>{me?.fullName || "Student"}</Text>
            <Text style={styles.emailText}>{me?.email || ""}</Text>
            <Text style={styles.codeLabel}>Unique Code</Text>
            <Text style={styles.codeValue}>{uniqueCode}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nickname</Text>
          <View style={styles.rowBetween}>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="Set a nickname"
              style={[
                styles.input,
                nicknameLocked && { backgroundColor: "#F3F4F6" },
              ]}
              editable={!nicknameLocked}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, nicknameLocked && { opacity: 0.6 }]}
              onPress={saveNickname}
              disabled={nicknameLocked}
            >
              <Text style={styles.primaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Link to School</Text>
          {isLinkedToSchool ? (
            <TouchableOpacity
              style={styles.emptyState}
              onPress={() => setSchoolModal(true)}
            >
              <Ionicons name="school" size={24} color="#10B981" />
              <Text style={styles.emptyText}>
                Linked to a school (tap to view)
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.helpText}>
                Enter your school code to link your profile
              </Text>
              <View style={styles.rowBetween}>
                <TextInput
                  value={schoolCode}
                  onChangeText={setSchoolCode}
                  placeholder="School code"
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={linkSchool}
                >
                  <Text style={styles.primaryBtnText}>Link</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Link to Parent</Text>
          {isLinkedToParent ? (
            <TouchableOpacity
              style={styles.emptyState}
              onPress={() => setParentModal(true)}
            >
              <Ionicons name="people" size={24} color="#10B981" />
              <Text style={styles.emptyText}>
                Linked to a parent (tap to view)
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.helpText}>
                Enter parent code to share your progress
              </Text>
              <View style={styles.rowBetween}>
                <TextInput
                  value={parentCode}
                  onChangeText={setParentCode}
                  placeholder="Parent code"
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={linkParent}
                >
                  <Text style={styles.primaryBtnText}>Link</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
      <FooterNavigation />
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          logout();
        }}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={schoolModal}
        animationType="fade"
        onRequestClose={() => setSchoolModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSchoolModal(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>School Details</Text>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setSchoolModal(false)}
                  >
                    <Ionicons name="close" size={20} color="#111827" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Name:</Text>{" "}
                    {me?.school?.name || "-"}
                  </Text>
                  <Text style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Code:</Text>{" "}
                    {me?.school?.code || "-"}
                  </Text>
                  <Text style={styles.modalRow}>
                    <Text style={styles.modalLabel}>City:</Text>{" "}
                    {me?.school?.city || "-"}
                  </Text>
                  <Text style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Country:</Text>{" "}
                    {me?.school?.country || "-"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 12 }]}
                  onPress={() => setSchoolModal(false)}
                >
                  <Text style={styles.primaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent
        visible={parentModal}
        animationType="fade"
        onRequestClose={() => setParentModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setParentModal(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Parent Details</Text>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setParentModal(false)}
                  >
                    <Ionicons name="close" size={20} color="#111827" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Name:</Text>{" "}
                    {me?.parent?.name || "-"}
                  </Text>
                  <Text style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Email:</Text>{" "}
                    {me?.parent?.email || "-"}
                  </Text>
                  <Text style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Parent Code:</Text>{" "}
                    {me?.parent?.parentCode || "-"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 12 }]}
                  onPress={() => setParentModal(false)}
                >
                  <Text style={styles.primaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    margin: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatarWrapper: { marginRight: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: "#ffffff", fontSize: 20, fontWeight: "800" },
  uploadBtn: {
    position: "absolute",
    right: -6,
    bottom: -6,
    backgroundColor: "#8B5CF6",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: { fontSize: 18, fontWeight: "700", color: "#111827" },
  emailText: { color: "#6B7280", marginTop: 2 },
  codeLabel: { color: "#6B7280", fontSize: 12, marginTop: 8 },
  codeValue: { color: "#111827", fontWeight: "800", letterSpacing: 2 },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  rowBetween: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
  },
  primaryBtn: {
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryBtnText: { color: "#ffffff", fontWeight: "700" },
  helpText: { color: "#6B7280", marginBottom: 8 },
  emptyState: { flexDirection: "row", alignItems: "center", gap: 8 },
  emptyText: { color: "#10B981", fontWeight: "600" },
  logoutBtn: { position: "absolute", right: 16, top: 18 },
  logoutText: { color: "#EF4444", fontWeight: "700" },
  // Modals (upgraded)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "92%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  modalBody: { marginTop: 6 },
  modalRow: { color: "#111827", marginTop: 6 },
  modalLabel: { color: "#6B7280" },
});

export default SettingsPage;

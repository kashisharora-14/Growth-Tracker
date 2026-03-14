import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { GradientHeader } from "@/components/GradientHeader";
import { CommunityPost, useRecovery } from "@/context/RecoveryContext";

const GROUPS = [
  "All",
  "Alcohol Recovery",
  "Drug Recovery",
  "Nicotine Quitters",
  "Night Craving Support",
  "30-Day Challenge",
];

function PostCard({
  post,
  onLike,
}: {
  post: CommunityPost;
  onLike: () => void;
}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.avatar}</Text>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <Text style={styles.postGroup}>{post.group}</Text>
        </View>
        {post.daysSober !== undefined && post.daysSober > 0 && (
          <View style={styles.sobrietyBadge}>
            <Text style={styles.sobrietyBadgeText}>
              {post.daysSober}d sober
            </Text>
          </View>
        )}
        <Text style={styles.postTime}>{post.timestamp}</Text>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <Pressable style={styles.actionBtn} onPress={onLike}>
          <Feather
            name="heart"
            size={18}
            color={post.isLiked ? Colors.light.danger : Colors.light.textMuted}
            style={post.isLiked ? { opacity: 1 } : { opacity: 0.6 }}
          />
          <Text
            style={[
              styles.actionCount,
              post.isLiked && { color: Colors.light.danger },
            ]}
          >
            {post.likes}
          </Text>
        </Pressable>
        <View style={styles.actionBtn}>
          <Feather name="message-circle" size={18} color={Colors.light.textMuted} style={{ opacity: 0.6 }} />
          <Text style={styles.actionCount}>{post.replies}</Text>
        </View>
        <Pressable style={styles.actionBtn}>
          <Feather name="share-2" size={18} color={Colors.light.textMuted} style={{ opacity: 0.6 }} />
        </Pressable>
      </View>
    </View>
  );
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { communityPosts, likePost, addPost } = useRecovery();
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [showCompose, setShowCompose] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postGroup, setPostGroup] = useState("Alcohol Recovery");

  const topPad =
    Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const bottomPad =
    Platform.OS === "web" ? insets.bottom + 34 + 84 : insets.bottom + 100;

  const filtered =
    selectedGroup === "All"
      ? communityPosts
      : communityPosts.filter((p) => p.group === selectedGroup);

  const handlePost = () => {
    if (!postContent.trim()) return;
    addPost(postContent.trim(), postGroup);
    setPostContent("");
    setShowCompose(false);
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Community"
        subtitle="Share your journey"
        rightIcon="edit-3"
        onRightPress={() => setShowCompose(true)}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onLike={() => likePost(item.id)} />
        )}
        contentContainerStyle={{ paddingBottom: bottomPad, paddingTop: 8 }}
        scrollEnabled={!!filtered.length}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <FlatList
            data={GROUPS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(g) => g}
            contentContainerStyle={styles.groupsRow}
            renderItem={({ item: g }) => (
              <Pressable
                style={[
                  styles.groupChip,
                  selectedGroup === g && styles.groupChipSelected,
                ]}
                onPress={() => setSelectedGroup(g)}
              >
                <Text
                  style={[
                    styles.groupChipText,
                    selectedGroup === g && styles.groupChipTextSelected,
                  ]}
                >
                  {g}
                </Text>
              </Pressable>
            )}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={40} color={Colors.light.textMuted} />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>
              Be the first to share your story
            </Text>
          </View>
        }
      />

      <Modal
        visible={showCompose}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCompose(false)}
      >
        <KeyboardAvoidingView
          style={styles.composeModal}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.composeHeader, { paddingTop: insets.top + 20 }]}>
            <Pressable onPress={() => setShowCompose(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.composeTitle}>Share with Community</Text>
            <Pressable
              style={[
                styles.postBtn,
                !postContent.trim() && { opacity: 0.4 },
              ]}
              onPress={handlePost}
              disabled={!postContent.trim()}
            >
              <Text style={styles.postBtnText}>Post</Text>
            </Pressable>
          </View>

          <Text style={styles.groupSelectLabel}>Select Group</Text>
          <FlatList
            data={GROUPS.slice(1)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(g) => g}
            contentContainerStyle={styles.groupsRow}
            renderItem={({ item: g }) => (
              <Pressable
                style={[
                  styles.groupChip,
                  postGroup === g && styles.groupChipSelected,
                ]}
                onPress={() => setPostGroup(g)}
              >
                <Text
                  style={[
                    styles.groupChipText,
                    postGroup === g && styles.groupChipTextSelected,
                  ]}
                >
                  {g}
                </Text>
              </Pressable>
            )}
          />

          <TextInput
            style={styles.composeInput}
            placeholder="Share your story, progress, or ask for support..."
            placeholderTextColor={Colors.light.textMuted}
            multiline
            value={postContent}
            onChangeText={setPostContent}
            autoFocus
            maxLength={500}
          />
          <Text style={styles.charCount}>{postContent.length}/500</Text>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  composeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  groupsRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  groupChipSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  groupChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  groupChipTextSelected: {
    color: "#fff",
  },
  postCard: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  postMeta: {
    flex: 1,
    gap: 1,
  },
  postAuthor: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  postGroup: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  sobrietyBadge: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  sobrietyBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
  postTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  postContent: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 22,
  },
  postActions: {
    flexDirection: "row",
    gap: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  composeModal: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  composeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  composeTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  postBtn: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  groupSelectLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  composeInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
});

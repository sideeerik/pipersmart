import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { getToken, getUser } from '../../utils/helpers';
import MobileHeader from '../../shared/MobileHeader';

const { width } = Dimensions.get('window');

const EMOJI_REACTIONS = [
  { emoji: 'like', label: '👍' },
  { emoji: 'heart', label: '❤️' },
  { emoji: 'haha', label: '😂' },
  { emoji: 'angry', label: '😠' },
  { emoji: 'sad', label: '😢' }
];

export default function MessengerScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEmojiReaction, setShowEmojiReaction] = useState(null); // messageId of message to react to
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSlideAnim] = useState(new Animated.Value(-300));
  const flatListRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const shouldScrollToLatestRef = useRef(false);
  const firstScrollDoneRef = useRef(false);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false));
  };

  const colors = {
    primary: '#1B4D3E',
    primaryDark: '#0D2818',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    success: '#27AE60',
    danger: '#E74C3C',
    message: '#EEF4FF',
    messageSent: '#DCFCE7',
  };

  const sortMessagesAsc = (items = []) => {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => {
      const ta = new Date(a?.createdAt).getTime() || 0;
      const tb = new Date(b?.createdAt).getTime() || 0;
      return ta - tb;
    });
  };

  const scrollToLatest = (animated = true) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
  };

  useEffect(() => {
    const initialize = async () => {
      const user = await getUser();
      if (user?.id) {
        setCurrentUserId(user.id);
      }
      await fetchChats();
      await fetchFriends();
    };
    initialize();
    
    const interval = setInterval(async () => {
      await fetchChats();
      await fetchFriends();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setMessages([]);
      setLoadingMessages(true);
      setShowJumpToLatest(false);
      isAtBottomRef.current = true;
      shouldScrollToLatestRef.current = true;
      firstScrollDoneRef.current = false;

      fetchMessages(selectedChat._id);
      const interval = setInterval(() => fetchMessages(selectedChat._id), 3000); // Refresh messages every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat || messages.length === 0) return;
    if (shouldScrollToLatestRef.current || isAtBottomRef.current) {
      scrollToLatest(firstScrollDoneRef.current);
      shouldScrollToLatestRef.current = false;
      firstScrollDoneRef.current = true;
      setShowJumpToLatest(false);
    }
  }, [messages, selectedChat?._id]);

  const fetchChats = async () => {
    try {
      const token = await getToken();
      const response = await axios.get('/api/v1/chat/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.data) {
        setChats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = await getToken();
      const response = await axios.get('/api/v1/users/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.data) {
        setFriends(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = await getToken();
      const response = await axios.get(`/api/v1/chat/${chatId}/messages?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.data) {
        setMessages(sortMessagesAsc(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };



  const sendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !selectedChat) return;

    setSendingMessage(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      
      if (messageInput.trim()) {
        formData.append('content', messageInput);
      }
      
      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: `chat_${Date.now()}.jpg`,
        });
      }

      const response = await axios.post(
        `/api/v1/chat/${selectedChat._id}/send`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          } 
        }
      );

      if (response.data?.data) {
        console.log(`✅ Message sent with ${selectedImage ? 'image' : 'text'}`);
        setMessages((prev) => sortMessagesAsc([...prev, response.data.data]));
        setMessageInput('');
        setSelectedImage(null);
        shouldScrollToLatestRef.current = true;
        
        // Refresh chats list to show updated lastMessage
        fetchChats();
        
        setTimeout(() => {
          scrollToLatest(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('❌ Message failed to send');
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const token = await getToken();
      await axios.delete(`/api/v1/chat/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(messages.filter((msg) => msg._id !== messageId));
      Alert.alert('Success', 'Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  const startChat = async (userId) => {
    try {
      const token = await getToken();
      const response = await axios.post(`/api/v1/chat/or-create/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.data) {
        const friend = friends.find(f => f._id === userId);
        const chatData = {
          ...response.data.data,
          friend: friend,
        };
        setSelectedChat(chatData);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to start chat');
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat.participants || !currentUserId) return null;
    return chat.participants.find(p => p._id?.toString() !== currentUserId?.toString());
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      const token = await getToken();
      await axios.put(
        `/api/v1/chat/${messageId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      const token = await getToken();
      const response = await axios.post(
        `/api/v1/chat/${messageId}/react`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.data) {
        const updatedMessages = messages.map(msg =>
          msg._id === messageId ? response.data.data : msg
        );
        setMessages(updatedMessages);
        setShowEmojiReaction(null);
        console.log(`✅ Reaction ${emoji} added`);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      Alert.alert('Error', 'Failed to add reaction');
    }
  };

  const removeReaction = async (messageId) => {
    try {
      const token = await getToken();
      const response = await axios.delete(
        `/api/v1/chat/${messageId}/react`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.data) {
        const updatedMessages = messages.map(msg =>
          msg._id === messageId ? response.data.data : msg
        );
        setMessages(updatedMessages);
        console.log('✅ Reaction removed');
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const handleMessageListScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    const nearBottom = distanceFromBottom <= 90;

    isAtBottomRef.current = nearBottom;
    if (nearBottom) {
      setShowJumpToLatest(false);
    } else if (messages.length > 0) {
      setShowJumpToLatest(true);
    }
  };

  const jumpToLatest = () => {
    isAtBottomRef.current = true;
    setShowJumpToLatest(false);
    scrollToLatest(true);
  };

  // Merge friends with existing chats
  const mergedList = friends.map(friend => {
    const existingChat = chats.find(chat => 
      chat.participants.some(p => p._id.toString() === friend._id.toString())
    );
    return {
      ...existingChat,
      _id: existingChat?._id || friend._id,
      friend: friend,
      participants: existingChat?.participants || [friend],
      lastMessage: existingChat?.lastMessage || '',
      lastMessageTime: existingChat?.lastMessageTime || '',
    };
  });

  const filteredChats = mergedList.filter((item) => {
    return item.friend?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Chat List View
  if (!selectedChat) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <MobileHeader navigation={navigation} drawerOpen={drawerOpen} openDrawer={openDrawer} closeDrawer={closeDrawer} drawerSlideAnim={drawerSlideAnim} />

        {/* Search */}
        <View style={[styles.searchContainer, { borderColor: colors.border }]}>
          <Feather name="search" size={20} color={colors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search chats..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Chats List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : filteredChats.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chat-outline" size={60} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No chats yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
              Add friends and start chatting!
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const friend = item.friend;
              return (
                <TouchableOpacity
                  style={[
                    styles.chatItem,
                    { borderColor: colors.border, backgroundColor: '#FFFFFF' },
                    item.unreadCount > 0 && styles.chatItemUnread,
                  ]}
                  onPress={() => {
                    if (item.lastMessage) {
                      setSelectedChat(item);
                    } else {
                      startChat(friend._id);
                    }
                  }}
                >
                  <Image
                    source={{
                      uri: friend?.avatar?.url || `https://ui-avatars.com/api/?name=${friend?.name}`,
                    }}
                    style={styles.avatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.chatName, { color: colors.text }]}>
                      {friend?.name}
                    </Text>
                    <Text
                      style={[styles.chatMessage, { color: colors.textLight }]}
                      numberOfLines={1}
                    >
                      {item.lastMessage ? item.lastMessage : (item.attachment ? '📷 Image' : 'Tap to start chat')}
                    </Text>
                  </View>
                  <View style={styles.chatRightContainer}>
                    <Text style={[styles.chatTime, { color: colors.textLight }]}>
                      {item.lastMessageTime
                        ? new Date(item.lastMessageTime).toLocaleDateString()
                        : ''}
                    </Text>
                    {item.unreadCount > 0 && (
                      <View style={[styles.unreadBadge, { backgroundColor: colors.danger }]}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            scrollEnabled={true}
          />
        )}
      </SafeAreaView>
    );
  }

  // Chat Detail View
  const otherParticipant = selectedChat?.friend || getOtherParticipant(selectedChat);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader navigation={navigation} drawerOpen={drawerOpen} openDrawer={openDrawer} closeDrawer={closeDrawer} drawerSlideAnim={drawerSlideAnim} />
      
      <View style={[styles.chatHeader, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatHeaderName}>{otherParticipant?.name}</Text>
          <Text style={styles.chatHeaderStatus}>Active now</Text>
        </View>
        <Image
          source={{
            uri: otherParticipant?.avatar?.url || `https://ui-avatars.com/api/?name=${otherParticipant?.name}`,
          }}
          style={styles.headerAvatar}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        {loadingMessages ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.messagesArea}>
            <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messagesListContent}
            onScroll={handleMessageListScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSent = item.sender?._id?.toString() === currentUserId?.toString();
              
              // Mark message as read if it's from other user and not read yet
              if (!isSent && !item.isRead) {
                markMessageAsRead(item._id);
              }

              const userReaction = item.reactions?.find(r => r.userId?._id?.toString() === currentUserId?.toString() || r.userId?.toString() === currentUserId?.toString());
              const reactionCounts = {};
              item.reactions?.forEach(r => {
                reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
              });

              return (
                <View style={styles.messageContainer}>
                  <View
                    style={[
                      styles.messageWrapper,
                      isSent ? styles.sentMessage : styles.receivedMessage,
                    ]}
                  >
                    {!isSent && (
                      <Image
                        source={{
                          uri: item.sender?.avatar?.url || `https://ui-avatars.com/api/?name=${item.sender?.name}`,
                        }}
                        style={styles.messageAvatar}
                      />
                    )}
                    <TouchableOpacity
                      style={[
                        styles.messageBubble,
                        {
                          backgroundColor: isSent ? colors.messageSent : colors.message,
                        },
                      ]}
                      onLongPress={() => {
                        setShowEmojiReaction(item._id);
                      }}
                    >
                      {item.attachment?.url && (
                        <Image
                          source={{ uri: item.attachment.url }}
                          style={styles.attachmentImage}
                          resizeMode="contain"
                        />
                      )}
                      {item.content && (
                        <Text style={[styles.messageContent, { color: '#000000' }]}>
                          {item.content}
                        </Text>
                      )}
                      <View style={styles.messageFooter}>
                        <Text style={[styles.messageTime, { color: '#666666' }]}>
                          {new Date(item.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </Text>
                        {isSent && (
                          <Text style={[styles.readStatus, { color: '#666666', marginLeft: 4 }]}>
                            {item.isRead ? '✓✓' : '✓'}
                          </Text>
                        )}
                      </View>
                      {item.isEdited && (
                        <Text style={[styles.editedTag, { color: '#999999' }]}>
                          (edited)
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Reactions Display */}
                  {Object.keys(reactionCounts).length > 0 && (
                    <View style={[styles.reactionsContainer, { justifyContent: isSent ? 'flex-end' : 'flex-start', marginHorizontal: isSent ? 0 : 40 }]}>
                      {Object.entries(reactionCounts).map(([emoji, count]) => {
                        const emojiLabel = EMOJI_REACTIONS.find(e => e.emoji === emoji)?.label || emoji;
                        const showCount = count > 1;
                        return (
                          <TouchableOpacity
                            key={emoji}
                            style={[
                              styles.reactionBubble,
                              { backgroundColor: userReaction?.emoji === emoji ? 'rgba(27, 77, 62, 0.2)' : '#f0f0f0' }
                            ]}
                            onPress={() => {
                              if (userReaction?.emoji === emoji) {
                                removeReaction(item._id);
                              } else {
                                addReaction(item._id, emoji);
                              }
                            }}
                          >
                            <Text style={styles.reactionEmoji}>{emojiLabel}</Text>
                            {showCount && <Text style={styles.reactionCount}>{count}</Text>}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Emoji Reaction Picker */}
                  {showEmojiReaction === item._id && (
                    <View style={[styles.emojiPickerContainer, { justifyContent: isSent ? 'flex-end' : 'flex-start', marginHorizontal: isSent ? 0 : 40 }]}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiPicker}>
                        {EMOJI_REACTIONS.map((e) => (
                          <TouchableOpacity
                            key={e.emoji}
                            style={styles.emojiOption}
                            onPress={() => {
                              addReaction(item._id, e.emoji);
                              setShowEmojiReaction(null);
                            }}
                          >
                            <Text style={styles.emojiOptionLabel}>{e.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Delete and Cancel Options */}
                  {showEmojiReaction === item._id && item.sender?._id?.toString() === currentUserId?.toString() && (
                    <View style={[styles.emojiActionContainer, { justifyContent: isSent ? 'flex-end' : 'flex-start', marginHorizontal: isSent ? 0 : 40 }]}>
                      <TouchableOpacity
                        style={[styles.emojiActionBtn, { backgroundColor: '#E74C3C' }]}
                        onPress={() => {
                          Alert.alert('Delete Message?', 'This cannot be undone.', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => {
                                deleteMessage(item._id);
                                setShowEmojiReaction(null);
                              },
                            },
                          ]);
                        }}
                      >
                        <Feather name="trash-2" size={16} color="#FFFFFF" />
                        <Text style={styles.emojiActionText}>Delete</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.emojiActionBtn, { backgroundColor: colors.textLight }]}
                        onPress={() => setShowEmojiReaction(null)}
                      >
                        <Feather name="x" size={16} color="#FFFFFF" />
                        <Text style={styles.emojiActionText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
            scrollEnabled={true}
          />
          {showJumpToLatest && (
            <TouchableOpacity style={styles.jumpToLatestBtn} onPress={jumpToLatest} activeOpacity={0.9}>
              <Feather name="arrow-down" size={16} color="#FFFFFF" />
              <Text style={styles.jumpToLatestText}>Latest</Text>
            </TouchableOpacity>
          )}
          </View>
        )}

        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setSelectedImage(null)}
            >
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input */}
        <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            <Feather name="paperclip" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.messageInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textLight}
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={sendMessage}
            disabled={sendingMessage || uploadingImage || (!messageInput.trim() && !selectedImage)}
          >
            {sendingMessage || uploadingImage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0D2818',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  drawer: {
    width: 300,
    height: '100%',
    paddingTop: 20,
  },
  drawerBackdrop: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: '#0D2818',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chatItemUnread: {
    borderColor: '#A6D5C0',
    backgroundColor: '#F4FBF8',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '800',
  },
  chatMessage: {
    fontSize: 13,
    marginTop: 4,
  },
  chatTime: {
    fontSize: 11,
  },
  chatRightContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatHeaderStatus: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  messagesArea: {
    flex: 1,
    backgroundColor: '#F1F6F4',
    position: 'relative',
  },
  messagesListContent: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  jumpToLatestBtn: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 14,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: '#1B4D3E',
    shadowColor: '#0D2818',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  jumpToLatestText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  messageContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  messageContent: {
    fontSize: 14,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  readStatus: {
    fontSize: 10,
  },
  editedTag: {
    fontSize: 9,
    marginTop: 2,
    fontStyle: 'italic',
  },
  attachmentImage: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: 8,
    marginBottom: 8,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
  },
  emojiPickerContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  emojiPicker: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  emojiOption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  emojiOptionLabel: {
    fontSize: 18,
  },
  emojiActionContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  emojiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  emojiActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 8,
    position: 'relative',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  attachButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECF5F1',
  },
  messageInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0D2818',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

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
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken, getUser } from '../../utils/helper';

const { width } = Dimensions.get('window');

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
  const flatListRef = useRef(null);

  const colors = {
    primary: '#1B4D3E',
    primaryDark: '#0D2818',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    success: '#27AE60',
    danger: '#E74C3C',
    message: '#E3F2FD',
    messageSent: '#C8E6C9',
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
      fetchMessages(selectedChat._id);
      const interval = setInterval(() => fetchMessages(selectedChat._id), 3000); // Refresh messages every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

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
        setMessages(response.data.data);
        console.log(`✅ Fetched ${response.data.data.length} messages from chat`);
        response.data.data.forEach((msg) => {
          console.log(`   - ${msg.sender?.name}: ${msg.content}`);
        });
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    setSendingMessage(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        `/api/v1/chat/${selectedChat._id}/send`,
        { content: messageInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data) {
        console.log(`✅ Message sent: "${messageInput.substring(0, 50)}..."`);
        setMessages([...messages, response.data.data]);
        setMessageInput('');
        
        // Refresh chats list to show updated lastMessage
        fetchChats();
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('❌ Message failed to send:', messageInput);
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
        fetchMessages(response.data.data._id);
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
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>

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
                  style={[styles.chatItem, { borderBottomColor: colors.border }]}
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
                      {item.lastMessage || 'Tap to start chat'}
                    </Text>
                  </View>
                  <Text style={[styles.chatTime, { color: colors.textLight }]}>
                    {item.lastMessageTime
                      ? new Date(item.lastMessageTime).toLocaleDateString()
                      : ''}
                  </Text>
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
      {/* Chat Header */}
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

      {/* Messages */}
      {loadingMessages ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const isSent = item.sender?._id?.toString() === currentUserId?.toString(); // Check if message is from current user
            return (
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
                    Alert.alert('Delete Message?', '', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteMessage(item._id),
                      },
                    ]);
                  }}
                >
                  <Text style={[styles.messageContent, { color: '#000000' }]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.messageTime, { color: '#666666' }]}>
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </Text>
                  {item.isEdited && (
                    <Text style={[styles.editedTag, { color: '#999999' }]}>
                      (edited)
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
          scrollEnabled={true}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Message Input */}
      <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
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
          disabled={sendingMessage || !messageInput.trim()}
        >
          {sendingMessage ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
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
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatName: {
    fontSize: 14,
    fontWeight: '700',
  },
  chatMessage: {
    fontSize: 12,
    marginTop: 4,
  },
  chatTime: {
    fontSize: 11,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  messageContent: {
    fontSize: 14,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  editedTag: {
    fontSize: 9,
    marginTop: 2,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

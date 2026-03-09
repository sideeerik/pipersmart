import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MobileHeader from '../../shared/MobileHeader';
import Notepad from '../../shared/Notepad';
import { getUser, logout } from '../../utils/helpers';

const colors = {
  pageBg: '#EEF4F0',
  forest: '#163D30',
  forestSoft: '#2D6A57',
  mint: '#DDEFE6',
  mintSoft: '#F3FAF6',
  card: '#FFFFFF',
  text: '#173A2E',
  textSoft: '#59776D',
  border: '#CFE1D7',
  userBubble: '#1B4D3E',
};

const PiperbotScreen = ({ navigation }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm PiperSmart Assistant. Ask me anything about black pepper farming.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef(null);
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;

  const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  const quickQuestions = [
    'How do I prevent black pepper diseases?',
    'What is the best harvest timing?',
    'How can I treat footrot disease?',
    'What weather is ideal for peppers?',
  ];

  const canSend = !!input.trim() && !isLoading;

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUser();

    Animated.spring(entranceAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 16,
      stiffness: 120,
      mass: 0.9,
    }).start();
  }, [entranceAnim]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const copyToClipboard = (text) => {
    Alert.alert('Unavailable', 'Copy is not available in this build.');
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!GROQ_API_KEY) {
      Alert.alert('Missing configuration', 'The chatbot API key is not configured for this build.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are PiperSmart Assistant, an expert in black pepper farming and disease detection. Provide concise, practical advice on cultivation, diseases, weather, and harvest readiness. Keep answers under 150 words and professional.',
            },
            {
              role: 'user',
              content: trimmed,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || 'Unable to generate response right now.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: botText,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: `Error: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const closeDrawer = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: -280,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(navigation),
      },
    ]);
  };

  const animatedEntryStyle = {
    opacity: entranceAnim,
    transform: [
      {
        translateY: entranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.bgDecor}>
        <View style={styles.bgOrbOne} />
        <View style={styles.bgOrbTwo} />
      </View>

      <MobileHeader
        navigation={navigation}
        user={user}
        drawerOpen={drawerOpen}
        openDrawer={openDrawer}
        closeDrawer={closeDrawer}
        drawerSlideAnim={drawerSlideAnim}
        onLogout={handleLogout}
      />

      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.View style={[styles.heroWrap, animatedEntryStyle]}>
          <LinearGradient
            colors={['#123A2D', '#1B4D3E', '#2D6A57']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.botIconCircle}>
                <Feather name="cpu" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>PiperBot Assistant</Text>
                <Text style={styles.heroSubtitle}>Live agronomy help for pepper growers</Text>
              </View>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>

            <View style={styles.heroChipsRow}>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>Disease Tips</Text>
              </View>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>Harvest Timing</Text>
              </View>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>Weather Advice</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.chatPanel, animatedEntryStyle]}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.messageRow, msg.type === 'user' ? styles.rowUser : styles.rowBot]}>
                {msg.type === 'bot' && (
                  <View style={styles.botBadgeCircle}>
                    <Feather name="zap" size={12} color={colors.forest} />
                  </View>
                )}

                <View style={styles.bubbleColumn}>
                  {msg.type === 'bot' && <Text style={styles.senderLabel}>PiperBot</Text>}
                  <View
                    style={[
                      styles.messageBubble,
                      msg.type === 'user' ? styles.userBubble : styles.botBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.type === 'user' ? styles.userText : styles.botText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>

                  {msg.type === 'bot' && (
                    <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(msg.text)}>
                      <Feather name="copy" size={13} color={colors.forestSoft} />
                      <Text style={styles.copyText}>Copy</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {isLoading && (
              <View style={[styles.messageRow, styles.rowBot]}>
                <View style={styles.botBadgeCircle}>
                  <Feather name="zap" size={12} color={colors.forest} />
                </View>
                <View style={styles.bubbleColumn}>
                  <Text style={styles.senderLabel}>PiperBot</Text>
                  <View style={[styles.messageBubble, styles.botBubble]}>
                    <View style={styles.typingIndicator}>
                      <View style={styles.typingDot} />
                      <View style={styles.typingDot} />
                      <View style={styles.typingDot} />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {messages.length <= 1 && !isLoading && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickLabel}>Try a starter question</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
                {quickQuestions.map((q, idx) => (
                  <TouchableOpacity key={idx} style={styles.quickBtn} onPress={() => handleQuickQuestion(q)}>
                    <Text style={styles.quickBtnText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ask about pepper farming, disease, harvest..."
                placeholderTextColor={colors.textSoft}
                value={input}
                onChangeText={setInput}
                editable={!isLoading}
                multiline
                maxLength={500}
              />
              <Text style={styles.counterText}>{input.length}/500</Text>
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={!canSend}
            >
              <LinearGradient
                colors={canSend ? ['#1B4D3E', '#2D6A57'] : ['#98ADA4', '#98ADA4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendBtnGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Feather name="send" size={18} color="#FFFFFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      <Notepad side="left" bottom={26} offset={16} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pageBg,
  },
  bgDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    overflow: 'hidden',
  },
  bgOrbOne: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(45, 106, 87, 0.16)',
  },
  bgOrbTwo: {
    position: 'absolute',
    top: -40,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(27, 77, 62, 0.12)',
  },
  keyboardWrap: {
    flex: 1,
  },
  heroWrap: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  heroCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#0E2D23',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '500',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#8BFFB2',
  },
  onlineText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chatPanel: {
    flex: 1,
    backgroundColor: colors.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 20,
  },
  messageRow: {
    marginVertical: 7,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowBot: {
    justifyContent: 'flex-start',
  },
  botBadgeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E4F3EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#D0E7DC',
  },
  bubbleColumn: {
    maxWidth: '82%',
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSoft,
    marginBottom: 4,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  messageBubble: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: colors.mintSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: colors.text,
  },
  copyBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F1F8F4',
  },
  copyText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.forestSoft,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 2,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.forest,
    opacity: 0.7,
  },
  quickQuestionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E3EEE8',
    backgroundColor: '#FBFEFC',
    paddingTop: 10,
    paddingBottom: 8,
  },
  quickLabel: {
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  quickRow: {
    paddingHorizontal: 12,
    paddingBottom: 2,
  },
  quickBtn: {
    backgroundColor: '#EDF8F2',
    borderWidth: 1,
    borderColor: '#D5EBDD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 8,
  },
  quickBtnText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4EFE9',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#F8FCFA',
  },
  input: {
    color: colors.text,
    fontSize: 13,
    maxHeight: 110,
    lineHeight: 18,
    paddingTop: 0,
    paddingBottom: 0,
  },
  counterText: {
    textAlign: 'right',
    marginTop: 6,
    fontSize: 10,
    color: colors.textSoft,
    fontWeight: '600',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.8,
  },
  sendBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PiperbotScreen;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from 'react-native-dotenv';
import { getUser, getToken, onAuthChange } from '../utils/helper';

const { width, height } = Dimensions.get('window');

const COLORS = [
  '#FFFFFF', // White
  '#E8F5E9', // Light Green
  '#E3F2FD', // Light Blue
  '#FFF3E0', // Light Orange
  '#F3E5F5', // Light Purple
  '#FFEBEE', // Light Red
];

export default function Notepad() {
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editingNote, setEditingNote] = useState(null);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (modalVisible) {
      fetchNotes();
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [modalVisible]);

  // Pulse animation for FAB
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${BACKEND_URL}/api/v1/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for your note');
      return;
    }

    try {
      const token = await getToken();
      const payload = { title, content, color: selectedColor };
      
      if (editingNote) {
        await axios.put(`${BACKEND_URL}/api/v1/notes/${editingNote._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${BACKEND_URL}/api/v1/notes`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Reset form
      setTitle('');
      setContent('');
      setSelectedColor(COLORS[0]);
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleDeleteNote = async (id) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${BACKEND_URL}/api/v1/notes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchNotes();
            } catch (error) {
              console.error('Error deleting note:', error);
            }
          }
        }
      ]
    );
  };

  const handleToggleComplete = async (note) => {
    try {
      const token = await getToken();
      await axios.put(`${BACKEND_URL}/api/v1/notes/${note._id}`, 
        { isCompleted: !note.isCompleted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotes();
    } catch (error) {
      console.error('Error toggling note:', error);
    }
  };

  const startEditing = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSelectedColor(note.color);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setSelectedColor(COLORS[0]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabAnim }] }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="edit-3" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Notes 📝</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.contentInput}
                placeholder="Write your note here..."
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
              
              {/* Color Picker */}
              <View style={styles.colorPicker}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <View style={styles.actionButtons}>
                {editingNote && (
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote}>
                  <Feather name="check" size={18} color="#FFF" />
                  <Text style={styles.saveButtonText}>
                    {editingNote ? 'Update' : 'Add Note'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes List */}
            {loading ? (
              <ActivityIndicator size="large" color="#1B4D3E" style={{ marginTop: 20 }} />
            ) : (
              <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
                {notes.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Feather name="clipboard" size={40} color="#DDD" />
                    <Text style={styles.emptyText}>No notes yet. Start writing!</Text>
                  </View>
                ) : (
                  notes.map((note) => (
                    <View key={note._id} style={[styles.noteCard, { backgroundColor: note.color }]}>
                      <TouchableOpacity 
                        style={styles.checkbox}
                        onPress={() => handleToggleComplete(note)}
                      >
                        <Feather 
                          name={note.isCompleted ? "check-square" : "square"} 
                          size={22} 
                          color={note.isCompleted ? "#27AE60" : "#666"} 
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.noteContent}
                        onPress={() => startEditing(note)}
                      >
                        <Text style={[
                          styles.noteTitle,
                          note.isCompleted && styles.completedText
                        ]}>
                          {note.title}
                        </Text>
                        {note.content ? (
                          <Text style={[
                            styles.noteBody,
                            note.isCompleted && styles.completedText
                          ]} numberOfLines={2}>
                            {note.content}
                          </Text>
                        ) : null}
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteNote(note._id)}
                      >
                        <Feather name="trash-2" size={18} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 100, // Positioned above the bottom navigation/tabs
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4AF37', // Accent Gold color
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    height: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  closeButton: {
    padding: 5,
  },
  inputSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 20,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    color: '#333',
  },
  contentInput: {
    fontSize: 14,
    minHeight: 60,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#1B4D3E',
    transform: [{ scale: 1.1 }],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#1B4D3E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  notesList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 1,
  },
  checkbox: {
    marginRight: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  noteBody: {
    fontSize: 13,
    color: '#666',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteButton: {
    padding: 8,
  },
});

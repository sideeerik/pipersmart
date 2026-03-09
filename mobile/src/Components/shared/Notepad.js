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
  Keyboard,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { getToken } from '../utils/helpers';
import { BACKEND_URL } from 'react-native-dotenv';

const COLORS = [
  '#FFFFFF',
  '#E8F5E9',
  '#E3F2FD',
  '#FFF3E0',
  '#F3E5F5',
  '#FFEBEE',
];

const THEME = {
  primary: '#1B4D3E',
  primarySoft: '#2C6A55',
  accent: '#D4AF37',
  text: '#173A2E',
  textSoft: '#5D786F',
  border: '#D7E7DF',
  card: '#FFFFFF',
  bgSoft: '#F6FBF8',
};

export default function Notepad({ side = 'right', bottom = 20, offset = 20 }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (modalVisible) {
      fetchNotes();
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 110,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.92);
      overlayAnim.setValue(0);
    }
  }, [modalVisible, overlayAnim, scaleAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabAnim, {
          toValue: 1.06,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fabAnim]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${BACKEND_URL}/api/v1/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data.notes || []);
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
      setSaving(true);
      Keyboard.dismiss();
      const token = await getToken();
      const payload = { title, content, color: selectedColor };
      let response;

      if (editingNote) {
        response = await axios.put(`${BACKEND_URL}/api/v1/notes/${editingNote._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedNote = response.data?.note;
        if (updatedNote) {
          setNotes((prevNotes) =>
            prevNotes.map((note) => (note._id === updatedNote._id ? updatedNote : note))
          );
        }
      } else {
        response = await axios.post(`${BACKEND_URL}/api/v1/notes`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const createdNote = response.data?.note;
        if (createdNote) {
          setNotes((prevNotes) => [createdNote, ...prevNotes]);
        }
      }

      setTitle('');
      setContent('');
      setSelectedColor(COLORS[0]);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await axios.delete(`${BACKEND_URL}/api/v1/notes/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchNotes();
          } catch (error) {
            console.error('Error deleting note:', error);
          }
        },
      },
    ]);
  };

  const handleToggleComplete = async (note) => {
    try {
      const token = await getToken();
      await axios.put(
        `${BACKEND_URL}/api/v1/notes/${note._id}`,
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
    setTitle(note.title || '');
    setContent(note.content || '');
    setSelectedColor(note.color || COLORS[0]);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setSelectedColor(COLORS[0]);
  };

  const formatNoteDate = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const fabPositionStyle = side === 'left' ? { left: offset, bottom } : { right: offset, bottom };

  return (
    <>
      <Animated.View style={[styles.fabContainer, fabPositionStyle, { transform: [{ scale: fabAnim }] }]}>
        <TouchableOpacity style={styles.fabShell} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <LinearGradient
            colors={[THEME.accent, '#C3932B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Feather name="edit-3" size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalRoot}>
          <Animated.View style={[styles.modalOverlay, { opacity: overlayAnim }]}>
            <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={() => setModalVisible(false)} />

            <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={[THEME.primary, THEME.primarySoft]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalHeader}
              >
                <View>
                  <Text style={styles.modalEyebrow}>Field Notes</Text>
                  <Text style={styles.modalTitle}>My Notepad</Text>
                  <Text style={styles.modalSubTitle}>{notes.length} saved note{notes.length === 1 ? '' : 's'}</Text>
                </View>

                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Feather name="x" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.inputSection}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#90A9A0"
                />

                <TextInput
                  style={styles.contentInput}
                  placeholder="Write your note here..."
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#90A9A0"
                />

                <View style={styles.colorPickerRow}>
                  {COLORS.map((color) => {
                    const selected = selectedColor === color;
                    return (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          selected && styles.selectedColor,
                        ]}
                        onPress={() => setSelectedColor(color)}
                      >
                        {selected ? <Feather name="check" size={12} color={THEME.primary} /> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.actionButtons}>
                  {editingNote ? (
                    <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSaveNote}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Feather name="check" size={16} color="#FFFFFF" />
                    )}
                    <Text style={styles.saveButtonText}>
                      {saving ? 'Saving...' : editingNote ? 'Update' : 'Add Note'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.listHeaderRow}>
                <Text style={styles.listTitle}>Saved Notes</Text>
                <Text style={styles.listCount}>{notes.length}</Text>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color={THEME.primary} style={styles.loader} />
              ) : (
                <ScrollView style={styles.notesList} contentContainerStyle={styles.notesListContent}>
                  {notes.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Feather name="file-text" size={38} color="#BFD3C9" />
                      <Text style={styles.emptyTitle}>No notes yet</Text>
                      <Text style={styles.emptyText}>Add your first field note above.</Text>
                    </View>
                  ) : (
                    notes.map((note) => (
                      <View key={note._id} style={[styles.noteCard, { backgroundColor: note.color || '#FFFFFF' }]}>
                        <TouchableOpacity style={styles.checkbox} onPress={() => handleToggleComplete(note)}>
                          <Feather
                            name={note.isCompleted ? 'check-circle' : 'circle'}
                            size={22}
                            color={note.isCompleted ? '#27AE60' : '#8AA79C'}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.noteContent} onPress={() => startEditing(note)}>
                          <View style={styles.noteTopRow}>
                            <Text style={[styles.noteTitle, note.isCompleted && styles.completedText]} numberOfLines={1}>
                              {note.title}
                            </Text>
                            {!!formatNoteDate(note.createdAt || note.updatedAt) && (
                              <Text style={styles.noteDate}>{formatNoteDate(note.createdAt || note.updatedAt)}</Text>
                            )}
                          </View>

                          {note.content ? (
                            <Text
                              style={[styles.noteBody, note.isCompleted && styles.completedText]}
                              numberOfLines={3}
                            >
                              {note.content}
                            </Text>
                          ) : (
                            <Text style={styles.noteBodyPlaceholder}>No additional details</Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteNote(note._id)}>
                          <Feather name="trash-2" size={16} color="#E65A4D" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>
              )}
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    zIndex: 999,
  },
  fabShell: {
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 9,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  modalRoot: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 25, 20, 0.52)',
    justifyContent: 'center',
    padding: 16,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    height: '88%',
    backgroundColor: '#F9FCFA',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D7E7DF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalEyebrow: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  modalSubTitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  inputSection: {
    marginHorizontal: 14,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.card,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: THEME.bgSoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    color: THEME.text,
  },
  contentInput: {
    fontSize: 14,
    minHeight: 92,
    maxHeight: 130,
    paddingHorizontal: 11,
    paddingVertical: 10,
    backgroundColor: THEME.bgSoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    color: THEME.text,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  colorPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C9DBD1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: THEME.primary,
    transform: [{ scale: 1.08 }],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  saveButton: {
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D5E2DC',
    backgroundColor: '#F8FBF9',
  },
  cancelButtonText: {
    color: '#607972',
    fontWeight: '700',
    fontSize: 12,
  },
  listHeaderRow: {
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.text,
  },
  listCount: {
    minWidth: 26,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: THEME.primary,
    backgroundColor: '#EAF4EF',
    borderWidth: 1,
    borderColor: '#D7E8DE',
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  loader: {
    marginTop: 24,
  },
  notesList: {
    flex: 1,
    minHeight: 140,
  },
  notesListContent: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    paddingVertical: 30,
  },
  emptyTitle: {
    marginTop: 10,
    color: '#6F8A80',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 4,
    color: '#94AAA2',
    fontSize: 13,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: 'rgba(23,58,46,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  noteContent: {
    flex: 1,
  },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  noteTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#1F3D34',
    marginBottom: 3,
  },
  noteDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6F8A80',
    textTransform: 'uppercase',
  },
  noteBody: {
    fontSize: 13,
    color: '#506A62',
    lineHeight: 18,
    marginTop: 1,
  },
  noteBodyPlaceholder: {
    fontSize: 12,
    color: '#8FA69E',
    fontStyle: 'italic',
    marginTop: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.58,
  },
  deleteButton: {
    marginLeft: 8,
    marginTop: 1,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(230,90,77,0.1)',
  },
});

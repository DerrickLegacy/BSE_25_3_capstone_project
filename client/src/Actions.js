// Actions.js

// Notes actions
export function setNotes(notes) {
  return {
    type: 'SET_NOTES',
    payload: notes,
  };
}

export function addNote(note) {
  return {
    type: 'ADD_NOTE',
    payload: note,
  };
}

export function updateNote(note) {
  return {
    type: 'UPDATE_NOTE',
    payload: note,
  };
}

export function removeNote(noteId) {
  return {
    type: 'REMOVE_NOTE',
    payload: noteId,
  };
}

export function setCurrentNote(note) {
  return {
    type: 'SET_CURRENT_NOTE',
    payload: note,
  };
}

export function clearCurrentNote() {
  return {
    type: 'CLEAR_CURRENT_NOTE',
  };
}

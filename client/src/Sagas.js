import { call, put, takeEvery } from 'redux-saga/effects';
import * as Sentry from '@sentry/react';
import Client from './Client';
import { setNotes, addNote, updateNote, removeNote } from './Actions';

function* fetchNotes() {
  try {
    const notes = yield call(Client.getNotes);
    yield put(setNotes(notes));
  } catch (error) {
    console.error('Error fetching notes:', error);
    Sentry.captureException(error, {
      tags: { section: 'notes', action: 'fetch' },
    });
  }
}

function* createNote(action) {
  try {
    const newNote = yield call(Client.createNote, action.payload);
    yield put(addNote(newNote));
  } catch (error) {
    console.error('Error creating note:', error);
    Sentry.captureException(error, {
      tags: { section: 'notes', action: 'create' },
      extra: { noteData: action.payload },
    });
  }
}

function* updateNoteSaga(action) {
  try {
    const updatedNote = yield call(
      Client.updateNote,
      action.payload.id,
      action.payload
    );
    yield put(updateNote(updatedNote));
  } catch (error) {
    console.error('Error updating note:', error);
    Sentry.captureException(error, {
      tags: { section: 'notes', action: 'update' },
      extra: { noteData: action.payload },
    });
  }
}

function* deleteNote(action) {
  try {
    yield call(Client.deleteNote, action.payload);
    yield put(removeNote(action.payload));
  } catch (error) {
    console.error('Error deleting note:', error);
    Sentry.captureException(error, {
      tags: { section: 'notes', action: 'delete' },
      extra: { noteId: action.payload },
    });
  }
}

function* watchNotes() {
  yield takeEvery('FETCH_NOTES', fetchNotes);
  yield takeEvery('CREATE_NOTE', createNote);
  yield takeEvery('UPDATE_NOTE_SAGA', updateNoteSaga);
  yield takeEvery('DELETE_NOTE', deleteNote);
}

export default watchNotes;

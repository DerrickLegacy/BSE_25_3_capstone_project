import { call, put, takeEvery } from 'redux-saga/effects';
import Client from './Client';
import { setNotes, addNote, updateNote, removeNote } from './Actions';

function* fetchNotes() {
  try {
    const notes = yield call(Client.getNotes);
    yield put(setNotes(notes));
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
}

function* createNote(action) {
  try {
    console.log('Saga createNote called with:', action.payload);
    const newNote = yield call(Client.createNote, action.payload);
    console.log('Note created successfully:', newNote);
    yield put(addNote(newNote));
    console.log('addNote action dispatched');
  } catch (error) {
    console.error('Error creating note:', error);
  }
}

function* updateNoteSaga(action) {
  try {
    console.log('Saga updateNoteSaga called with:', action.payload);
    const updatedNote = yield call(
      Client.updateNote,
      action.payload.id,
      action.payload
    );
    console.log('Note updated successfully:', updatedNote);
    yield put(updateNote(updatedNote));
    console.log('updateNote action dispatched');
  } catch (error) {
    console.error('Error updating note:', error);
  }
}

function* deleteNote(action) {
  try {
    yield call(Client.deleteNote, action.payload);
    yield put(removeNote(action.payload));
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

function* watchNotes() {
  yield takeEvery('FETCH_NOTES', fetchNotes);
  yield takeEvery('CREATE_NOTE', createNote);
  yield takeEvery('UPDATE_NOTE_SAGA', updateNoteSaga);
  yield takeEvery('DELETE_NOTE', deleteNote);
}

export default watchNotes;

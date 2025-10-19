import reducer from '../Reducers';

test('reducer initializes with empty notes', () => {
  const state = reducer(undefined, { type: '@@INIT' });
  expect(state.notes).toEqual([]);
  expect(state.currentNote).toBeNull();
});

test('reducer handles SET_NOTES', () => {
  const next = reducer(undefined, {
    type: 'SET_NOTES',
    payload: [{ id: 1, title: 'Test Note', content: 'Test content' }],
  });
  expect(next.notes).toEqual([{ id: 1, title: 'Test Note', content: 'Test content' }]);
});

test('reducer handles ADD_NOTE', () => {
  const initialState = { notes: [], currentNote: null };
  const next = reducer(initialState, {
    type: 'ADD_NOTE',
    payload: { id: 1, title: 'New Note', content: 'New content' },
  });
  expect(next.notes).toEqual([{ id: 1, title: 'New Note', content: 'New content' }]);
});

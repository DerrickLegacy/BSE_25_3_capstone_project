const initialState = {
  notes: [],
  currentNote: null,
};

function mainReducer(state, action) {
  const currentState = state || initialState;
  console.log('Reducer received action:', action.type, action.payload);

  switch (action.type) {
    case 'SET_NOTES':
      console.log('Setting notes:', action.payload);
      return {
        ...currentState,
        notes: action.payload,
      };
    case 'ADD_NOTE':
      console.log('Adding note:', action.payload);
      return {
        ...currentState,
        notes: [action.payload, ...currentState.notes],
      };
    case 'UPDATE_NOTE':
      console.log('Updating note:', action.payload);
      return {
        ...currentState,
        notes: currentState.notes.map((note) =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case 'REMOVE_NOTE':
      console.log('Removing note:', action.payload);
      return {
        ...currentState,
        notes: currentState.notes.filter((note) => note.id !== action.payload),
      };
    case 'SET_CURRENT_NOTE':
      return {
        ...currentState,
        currentNote: action.payload,
      };
    case 'CLEAR_CURRENT_NOTE':
      return {
        ...currentState,
        currentNote: null,
      };
    default:
      return currentState;
  }
}

export default mainReducer;

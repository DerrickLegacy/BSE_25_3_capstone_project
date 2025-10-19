const initialState = {
  notes: [],
  currentNote: null,
};

function mainReducer(state, action) {
  const currentState = state || initialState;

  switch (action.type) {
    case 'SET_NOTES':
      return {
        ...currentState,
        notes: action.payload,
      };
    case 'ADD_NOTE':
      return {
        ...currentState,
        notes: [action.payload, ...currentState.notes],
      };
    case 'UPDATE_NOTE':
      return {
        ...currentState,
        notes: currentState.notes.map((note) =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case 'REMOVE_NOTE':
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

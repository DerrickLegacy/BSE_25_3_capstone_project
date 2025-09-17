import './Actions';

const initialState = {
  searchData: [],
};

function mainReducer(state, action) {
  const currentState = state || initialState;
  switch (action.type) {
    case 'CHANGE_SEARCH_DATA':
      return {
        ...currentState,
        searchData: action.data,
      };
    default:
      return currentState;
  }
}

export default mainReducer;

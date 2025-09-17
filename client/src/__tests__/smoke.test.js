import reducer from '../Reducers';

test('reducer initializes with empty searchData', () => {
  const state = reducer(undefined, { type: '@@INIT' });
  expect(state.searchData).toEqual([]);
});

test('reducer handles CHANGE_SEARCH_DATA', () => {
  const next = reducer(undefined, {
    type: 'CHANGE_SEARCH_DATA',
    data: [{ first_name: 'Ada' }],
  });
  expect(next.searchData).toEqual([{ first_name: 'Ada' }]);
});

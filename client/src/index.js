import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import App from './App';
import mainReducer from './Reducers';
import watchFetchSearchData from './Sagas.js';

import './index.css';
import 'bootstrap/dist/css/bootstrap.css'; // keep this

// saga middleware
const sagaMiddleware = createSagaMiddleware();

// redux store with saga middleware
const store = createStore(mainReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(watchFetchSearchData);

// fetch initial data
store.dispatch({ type: 'FETCH_SEARCH_DATA', payload: { firstName: '*' } });

// create root and render
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

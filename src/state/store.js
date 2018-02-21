import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';
import thunk from 'redux-thunk';
import toolReducer from './reducers';
import { createLogger } from 'redux-logger';
import {createProvider} from 'react-redux';

const STORE_KEY = 'wordAlignment';

/**
 * Returns a configured store object
 * @return {Store<any>}
 */
export const configureStore = () => {
  const middlewares = [thunk, promise];
  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(createLogger());
  }

  return createStore(
    toolReducer,
    undefined,
    applyMiddleware(...middlewares)
  );
};

/**
 * Creates a connect HOC that is customized to read a particular store
 * @param {string} key - the store key
 * @return {function(*=, *=, *=, *=)}
 */
const createConnect = (key) => {
  return (
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    options = {}
  ) => {
    options.storeKey = key;
    return connect(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps,
      options
    );
  };
};

/**
 * A custom connect HOC to read the store
 * @type {function(*=, *=, *=, *=)}
 */
export const connect = createConnect(STORE_KEY);

/**
 * A custom provider to share the store
 */
export const Provider = createProvider(STORE_KEY);
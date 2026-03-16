<<<<<<< HEAD
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../reducer/rootReducer';
import generalSaga from '../saga/generalSaga';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(generalSaga);

export default store;
export type { RootState } from '../reducer/rootReducer';
=======
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../reducer/rootReducer';
import generalSaga from '../saga/generalSaga';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(generalSaga);

export default store;
export type { RootState } from '../reducer/rootReducer';
>>>>>>> 5e525f2 (Frontend updated)

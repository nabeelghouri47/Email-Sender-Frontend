import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import campaignSaga from './campaignSaga';

export default function* generalSaga() {
  yield all([authSaga(), campaignSaga()]);
}

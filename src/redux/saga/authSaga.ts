import { call, put, takeLatest } from 'redux-saga/effects';
import axiosInstance from '../../api/axiosInstance';
import { LOGIN_REQUEST } from '../../utils/actionsTypes';
import { loginSuccess, loginFailure } from '../../actions/authActions';

function* loginSaga(action: any): Generator<any, void, any> {
  try {
    const response = yield call(
      [axiosInstance, 'post'],
      '/auth/login',
      action.payload,
      { requiresAuth: false }
    );
    yield put(loginSuccess(response.data));
  } catch (error: any) {
    yield put(loginFailure(error.response?.data?.message || 'Login failed'));
  }
}

export default function* authSaga() {
  yield takeLatest(LOGIN_REQUEST, loginSaga);
}

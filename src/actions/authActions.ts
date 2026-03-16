import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  REFRESH_TOKEN_SUCCESS,
} from '../utils/actionsTypes';

export const loginRequest = (payload: { username: string; password: string }) => ({
  type: LOGIN_REQUEST,
  payload,
});

export const loginSuccess = (payload: any) => ({
  type: LOGIN_SUCCESS,
  payload,
});

export const loginFailure = (error: string) => ({
  type: LOGIN_FAILURE,
  payload: error,
});

export const logout = () => ({
  type: LOGOUT,
});

export const refreshTokenSuccess = (payload: any) => ({
  type: REFRESH_TOKEN_SUCCESS,
  payload,
});

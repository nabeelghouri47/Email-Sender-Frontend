import { call, put, takeLatest } from 'redux-saga/effects';
import axiosInstance from '../../api/axiosInstance';
import {
  FETCH_CAMPAIGNS_REQUEST,
  CREATE_CAMPAIGN_REQUEST,
  UPDATE_CAMPAIGN_REQUEST,
  DELETE_CAMPAIGN_REQUEST,
} from '../../utils/actionsTypes';
import {
  fetchCampaignsSuccess,
  fetchCampaignsFailure,
  createCampaignSuccess,
  createCampaignFailure,
  updateCampaignSuccess,
  updateCampaignFailure,
  deleteCampaignSuccess,
  deleteCampaignFailure,
} from '../../actions/campaignActions';

function* fetchCampaignsSaga(): Generator<any, void, any> {
  try {
    const response = yield call(axiosInstance.get, '/campaigns');
    yield put(fetchCampaignsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchCampaignsFailure(error.response?.data?.message || 'Failed to fetch campaigns'));
  }
}

function* createCampaignSaga(action: any): Generator<any, void, any> {
  try {
    const response = yield call(axiosInstance.post, '/campaigns', action.payload);
    yield put(createCampaignSuccess(response.data));
  } catch (error: any) {
    yield put(createCampaignFailure(error.response?.data?.message || 'Failed to create campaign'));
  }
}

function* updateCampaignSaga(action: any): Generator<any, void, any> {
  try {
    const response = yield call(
      axiosInstance.put,
      `/campaigns/${action.payload.id}`,
      action.payload
    );
    yield put(updateCampaignSuccess(response.data));
  } catch (error: any) {
    yield put(updateCampaignFailure(error.response?.data?.message || 'Failed to update campaign'));
  }
}

function* deleteCampaignSaga(action: any): Generator<any, void, any> {
  try {
    yield call(axiosInstance.delete, `/campaigns/${action.payload}`);
    yield put(deleteCampaignSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteCampaignFailure(error.response?.data?.message || 'Failed to delete campaign'));
  }
}

export default function* campaignSaga() {
  yield takeLatest(FETCH_CAMPAIGNS_REQUEST, fetchCampaignsSaga);
  yield takeLatest(CREATE_CAMPAIGN_REQUEST, createCampaignSaga);
  yield takeLatest(UPDATE_CAMPAIGN_REQUEST, updateCampaignSaga);
  yield takeLatest(DELETE_CAMPAIGN_REQUEST, deleteCampaignSaga);
}

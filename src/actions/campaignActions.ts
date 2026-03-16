import {
  FETCH_CAMPAIGNS_REQUEST,
  FETCH_CAMPAIGNS_SUCCESS,
  FETCH_CAMPAIGNS_FAILURE,
  CREATE_CAMPAIGN_REQUEST,
  CREATE_CAMPAIGN_SUCCESS,
  CREATE_CAMPAIGN_FAILURE,
  UPDATE_CAMPAIGN_REQUEST,
  UPDATE_CAMPAIGN_SUCCESS,
  UPDATE_CAMPAIGN_FAILURE,
  DELETE_CAMPAIGN_REQUEST,
  DELETE_CAMPAIGN_SUCCESS,
  DELETE_CAMPAIGN_FAILURE,
} from '../utils/actionsTypes';

export const fetchCampaignsRequest = () => ({
  type: FETCH_CAMPAIGNS_REQUEST,
});

export const fetchCampaignsSuccess = (campaigns: any[]) => ({
  type: FETCH_CAMPAIGNS_SUCCESS,
  payload: campaigns,
});

export const fetchCampaignsFailure = (error: string) => ({
  type: FETCH_CAMPAIGNS_FAILURE,
  payload: error,
});

export const createCampaignRequest = (campaign: any) => ({
  type: CREATE_CAMPAIGN_REQUEST,
  payload: campaign,
});

export const createCampaignSuccess = (campaign: any) => ({
  type: CREATE_CAMPAIGN_SUCCESS,
  payload: campaign,
});

export const createCampaignFailure = (error: string) => ({
  type: CREATE_CAMPAIGN_FAILURE,
  payload: error,
});

export const updateCampaignRequest = (campaign: any) => ({
  type: UPDATE_CAMPAIGN_REQUEST,
  payload: campaign,
});

export const updateCampaignSuccess = (campaign: any) => ({
  type: UPDATE_CAMPAIGN_SUCCESS,
  payload: campaign,
});

export const updateCampaignFailure = (error: string) => ({
  type: UPDATE_CAMPAIGN_FAILURE,
  payload: error,
});

export const deleteCampaignRequest = (id: number) => ({
  type: DELETE_CAMPAIGN_REQUEST,
  payload: id,
});

export const deleteCampaignSuccess = (id: number) => ({
  type: DELETE_CAMPAIGN_SUCCESS,
  payload: id,
});

export const deleteCampaignFailure = (error: string) => ({
  type: DELETE_CAMPAIGN_FAILURE,
  payload: error,
});

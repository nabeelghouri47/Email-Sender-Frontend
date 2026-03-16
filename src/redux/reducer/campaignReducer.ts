<<<<<<< HEAD
import { type Campaign } from '../../types';
import {
  FETCH_CAMPAIGNS_REQUEST,
  FETCH_CAMPAIGNS_SUCCESS,
  FETCH_CAMPAIGNS_FAILURE,
  CREATE_CAMPAIGN_SUCCESS,
  UPDATE_CAMPAIGN_SUCCESS,
  DELETE_CAMPAIGN_SUCCESS,
} from '../../utils/actionsTypes';

interface CampaignState {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
}

const initialState: CampaignState = {
  campaigns: [],
  loading: false,
  error: null,
};

export const campaignReducer = (state = initialState, action: any): CampaignState => {
  switch (action.type) {
    case FETCH_CAMPAIGNS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CAMPAIGNS_SUCCESS:
      return {
        ...state,
        campaigns: action.payload,
        loading: false,
        error: null,
      };

    case FETCH_CAMPAIGNS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CREATE_CAMPAIGN_SUCCESS:
      return {
        ...state,
        campaigns: [...state.campaigns, action.payload],
      };

    case UPDATE_CAMPAIGN_SUCCESS:
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case DELETE_CAMPAIGN_SUCCESS:
      return {
        ...state,
        campaigns: state.campaigns.filter((c) => c.id !== action.payload),
      };

    default:
      return state;
  }
};
=======
import { type Campaign } from '../../types';
import {
  FETCH_CAMPAIGNS_REQUEST,
  FETCH_CAMPAIGNS_SUCCESS,
  FETCH_CAMPAIGNS_FAILURE,
  CREATE_CAMPAIGN_SUCCESS,
  UPDATE_CAMPAIGN_SUCCESS,
  DELETE_CAMPAIGN_SUCCESS,
} from '../../utils/actionsTypes';

interface CampaignState {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
}

const initialState: CampaignState = {
  campaigns: [],
  loading: false,
  error: null,
};

export const campaignReducer = (state = initialState, action: any): CampaignState => {
  switch (action.type) {
    case FETCH_CAMPAIGNS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CAMPAIGNS_SUCCESS:
      return {
        ...state,
        campaigns: action.payload,
        loading: false,
        error: null,
      };

    case FETCH_CAMPAIGNS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CREATE_CAMPAIGN_SUCCESS:
      return {
        ...state,
        campaigns: [...state.campaigns, action.payload],
      };

    case UPDATE_CAMPAIGN_SUCCESS:
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case DELETE_CAMPAIGN_SUCCESS:
      return {
        ...state,
        campaigns: state.campaigns.filter((c) => c.id !== action.payload),
      };

    default:
      return state;
  }
};
>>>>>>> 5e525f2 (Frontend updated)

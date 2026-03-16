import { combineReducers } from 'redux';
import { authReducer } from './authReducer';
import { campaignReducer } from './campaignReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  campaigns: campaignReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;

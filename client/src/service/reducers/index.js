import { combineReducers } from "redux";
import { useReducer } from "./useReducers";

const rootReducer = combineReducers({
    user: useReducer,
});

export default rootReducer;


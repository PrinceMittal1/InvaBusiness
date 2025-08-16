import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import userData from "./Reducers/userData";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { configureStore } from "@reduxjs/toolkit";
import tempData from "./Reducers/tempData";

const reducers = combineReducers({
  userData,tempData
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["userData"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });
    return middlewares;
  },
});
store.subscribe(() => {
});
const persistor = persistStore(store);
export { store, persistor };

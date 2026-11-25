import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import formsReducer from "../features/forms/formsSlice";
import formBuilderReducer from "../features/forms/formBuilderSlice";
import submissionsReducer from "../features/submissions/submissionsSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forms: formsReducer,
    formBuilder: formBuilderReducer,
    submissions: submissionsReducer,
    dashboard: dashboardReducer
  }
});
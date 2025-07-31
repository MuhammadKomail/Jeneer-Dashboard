// authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  UserDataResponse,
  RoleAndAction,
  OtpHistoryItem,
  OtpHistoryData,
  RefreshTokenResponse,
} from "../../../types/authTypes";
import {
  logInUser,
  getOtpHistoryLogs,
  userRefreshToken,
} from "../../action/authAction/authAction";
import { deleteCookie, setCookie } from "cookies-next";
import toast from "react-hot-toast";

// Define the initial state for the authentication slice
interface AuthState {
  user: UserDataResponse | null;
  authToken: string | undefined;
  refreshToken: string | undefined;
  userType: string | undefined;
  role: string | undefined;
  apiActions: [] | null;
  roleAndActions: RoleAndAction[] | null;
  otpHistory: OtpHistoryData | null;
  otpHistoryData: OtpHistoryItem[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  authToken: undefined,
  refreshToken: undefined,
  userType: undefined,
  role: undefined,
  apiActions: null,
  roleAndActions: null,
  otpHistory: null,
  otpHistoryData: null,
  loading: false,
  error: null,
};

// Create the authentication slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logOutUser: (state) => {
      console.log("Logging out user");
      state.user = null;
      deleteCookie("UserAuthenticated");
      deleteCookie("AuthToken");
      deleteCookie("RefreshToken");
      deleteCookie("user_object");
      console.log("User logged out, reloading window");
      window.location.reload();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logInUser.pending, (state) => {
        console.log("Login request is pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(
        logInUser.fulfilled,
        (state, action: PayloadAction<UserDataResponse | null>) => {
          if (action.payload) {
            state.user = action.payload;
            state.authToken = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.userType = action.payload.userType;
            state.roleAndActions = action.payload.roleAndActions;
            state.role = action.payload.roleAndActions?.[0]?.name;
            state.apiActions = action.payload.roleAndActions?.[0]?.actions?.[0];

            setCookie("AuthToken", action.payload.token);
            setCookie("RefreshToken", action.payload.refreshToken);
            setCookie("user_object", action.payload);
          } else {
            console.error("Login request fulfilled, but no user data received");
          }
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(logInUser.rejected, (state, action: any) => {
        console.error("Login request rejected with error:", action.payload);
        toast.error(action.payload)
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getOtpHistoryLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getOtpHistoryLogs.fulfilled,
        (state, action: PayloadAction<OtpHistoryData | null>) => {
          console.log("API Response:", action.payload); // Debugging response
          console.log("ACTION DATA", action.payload);
          if (action.payload && action.payload) {
            console.log("Extracted History:", action.payload.history); // Debug history
            state.otpHistory = action.payload;
            state.otpHistoryData = action.payload.history || [];
          } else {
            console.warn("No data field in the payload");
            state.otpHistory = null;
            state.otpHistoryData = [];
          }
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(getOtpHistoryLogs.rejected, (state, action: any) => {
        // toast.error(action.payload)
        state.loading = false;
        state.error = action.payload as string;
      })

      // Note: Refresh Token 
      .addCase(userRefreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userRefreshToken.fulfilled, (state, action: PayloadAction<RefreshTokenResponse | null>) => {
        console.log("userRefreshToken.fulfilled", action.payload);

        state.loading = false;
      })
      .addCase(userRefreshToken.rejected, (state, action: PayloadAction<any>) => {
        // toast.error(action.payload)
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

// Export actions and reducer
export const { logOutUser } = authSlice.actions;
export default authSlice.reducer;

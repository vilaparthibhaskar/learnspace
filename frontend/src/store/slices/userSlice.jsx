// src/store/slices/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Safe getters (avoid SSR crashes)
const getLS = (key) =>
  typeof window !== "undefined" ? localStorage.getItem(key) : null;

const initialState = {
  name:        getLS("name")        || "",
  email:       getLS("email")       || "",
  phoneNumber: getLS("phoneNumber") || "",
  address:     getLS("address")     || "",
  role:        getLS("role")        || "",
  token:       getLS("jwt")         || null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    changeUserName: (state, action) => {
      state.name = action.payload || "";
      if (typeof window !== "undefined") localStorage.setItem("name", state.name);
    },
    changeEmail: (state, action) => {
      state.email = action.payload || "";
      if (typeof window !== "undefined") localStorage.setItem("email", state.email);
    },
    changePhoneNumber: (state, action) => {
      state.phoneNumber = action.payload || "";
      if (typeof window !== "undefined")
        localStorage.setItem("phoneNumber", state.phoneNumber);
    },
    changeAddress: (state, action) => {
      state.address = action.payload || "";
      if (typeof window !== "undefined") localStorage.setItem("address", state.address);
    },
    updateToken: (state, action) => {
      state.token = action.payload || null;
      if (typeof window !== "undefined") {
        if (state.token) localStorage.setItem("jwt", state.token);
        else localStorage.removeItem("jwt");
      }
    },
    changeRole: (state, action) => {
      state.role = action.payload || "";
      if (typeof window !== "undefined") localStorage.setItem("role", state.role);
    },

    // Convenient single action for login success
    loginSuccess: (state, action) => {
      const { name, email, phoneNumber, address, role, token } = action.payload || {};
      state.name = name || "";
      state.email = email || "";
      state.phoneNumber = phoneNumber || "";
      state.address = address || "";
      state.role = role || "";
      state.token = token || null;

      if (typeof window !== "undefined") {
        if (state.name)        localStorage.setItem("name", state.name);        else localStorage.removeItem("name");
        if (state.email)       localStorage.setItem("email", state.email);      else localStorage.removeItem("email");
        if (state.phoneNumber) localStorage.setItem("phoneNumber", state.phoneNumber); else localStorage.removeItem("phoneNumber");
        if (state.address)     localStorage.setItem("address", state.address);  else localStorage.removeItem("address");
        if (state.role)        localStorage.setItem("role", state.role);        else localStorage.removeItem("role");
        if (state.token)       localStorage.setItem("jwt", state.token);        else localStorage.removeItem("jwt");
      }
    },

    logout: (state) => {
      state.name = "";
      state.email = "";
      state.phoneNumber = "";
      state.address = "";
      state.role = "";
      state.token = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("phoneNumber");
        localStorage.removeItem("address");
        localStorage.removeItem("role");
        localStorage.removeItem("jwt");
      }
    },
  },
});

export const {
  changeAddress,
  changeEmail,
  changePhoneNumber,
  changeUserName,
  changeRole,
  updateToken,
  loginSuccess,
  logout,
} = userSlice.actions;

export default userSlice.reducer;

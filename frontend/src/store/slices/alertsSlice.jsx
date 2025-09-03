// src/store/slices/alertsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export const fetchMyAlerts = createAsyncThunk(
  "alerts/fetchMyAlerts",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState?.() || {};
      const token = state.user?.token || localStorage.getItem("jwt");
      const email = state.user?.email || localStorage.getItem("email");

      const res = await fetch(`${API_BASE}/api/alerts/my`, {
        method: "POST", // local-dev style (body contains email)
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        let message = res.statusText;
        try {
          const data = await res.json();
          message = data?.message || data?.error || message;
        } catch {
          try { message = (await res.text()) || message; } catch {}
        }
        return rejectWithValue(message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const alertsSlice = createSlice({
  name: "alerts",
  initialState: { items: [], status: "idle", error: null },
  reducers: {
    clearAlerts: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchMyAlerts.pending,   (s) => { s.status = "loading"; s.error = null; });
    b.addCase(fetchMyAlerts.fulfilled, (s,a) => { s.status = "succeeded"; s.items = a.payload; });
    b.addCase(fetchMyAlerts.rejected,  (s,a) => { s.status = "failed"; s.error = a.payload || "Failed to fetch alerts"; });
    b.addCase("user/logout",           (s)   => { s.items = []; s.status = "idle"; s.error = null; });
  },
});

export const { clearAlerts } = alertsSlice.actions;

export const selectAlerts         = (state) => state?.alerts?.items ?? [];
export const selectAlertsStatus   = (state) => state?.alerts?.status ?? "idle";
export const selectAlertsError    = (state) => state?.alerts?.error ?? null;

export default alertsSlice.reducer;

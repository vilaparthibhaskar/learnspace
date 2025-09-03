// src/store/submissionsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

/**
 * Fetch the current user's submissions.
 * Assumes your backend exposes GET /api/submissions/my
 * and uses JWT Bearer (optional) + cookies (optional).
 */
export const fetchMySubmissions = createAsyncThunk(
  "submissions/fetchMySubmissions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState?.() || {};
      const token = state.user?.token || localStorage.getItem("jwt");
      const email = state.user?.email || localStorage.getItem("email");

      const res = await fetch(`${API_BASE}/api/submissions/my`, {
        method: "POST",                                  
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


const submissionsSlice = createSlice({
  name: "submissions",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearSubmissions: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySubmissions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch submissions";
      });

    // Optional: clear on logout like your classes slice
    builder.addCase("user/logout", (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    });
  },
});

export const { clearSubmissions } = submissionsSlice.actions;

// Selectors
export const selectSubmissions = (state) => state?.submissions?.items ?? [];
export const selectSubmissionsStatus = (state) => state?.submissions?.status ?? "idle";
export const selectSubmissionsError = (state) => state?.submissions?.error ?? null;

export default submissionsSlice.reducer;

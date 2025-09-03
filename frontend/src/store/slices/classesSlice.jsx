import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";


export const fetchMyClasses = createAsyncThunk(
  "classes/fetchMyClasses",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState?.() || {};
      const token = state.user?.token || localStorage.getItem("jwt");
      const email =
        state.user?.email ||
        localStorage.getItem("email"); // make sure you save this on login

      const res = await fetch(`${API_BASE}/api/classes/my`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // keep auth header if you still return a token on login
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email, role: state.user?.role || "STUDENT" }),
      });

      if (!res.ok) {
        let message = res.statusText;
        try {
          const data = await res.json();
          message = data?.message || message;
        } catch { /* ignore parse errors */ }
        return rejectWithValue(message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const classesSlice = createSlice({
  name: "classes",
  initialState: {
    items: [],                 // array of classes
    status: "idle",            // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,               // error message string or null
  },
  reducers: {
    setClasses: (state, action) => {
      state.items = action.payload || [];
    },
    addClass: (state, action) => {
      if (action.payload) state.items.unshift(action.payload);
    },
    updateClass: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.items.findIndex((c) => c.id === updated.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...updated };
    },
    removeClass: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((c) => c.id !== id);
    },

    // loading helpers (parallel to your style)
    startLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },
    setSucceeded: (state) => {
      state.status = "succeeded";
    },
    setFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to load classes";
    },

    // clear/reset (mirrors your user.logout reset vibe)
    clearClasses: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Wire the thunk into the same status fields
    builder
      .addCase(fetchMyClasses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyClasses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchMyClasses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch classes";
      });

    // Optional: when user logs out, clear classes (keeps slices in sync)
    // This listens to the action type string to avoid circular imports.
    builder.addCase("user/logout", (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    });
  },
});

// -------- Actions (similar feel to your userSlice) --------
export const {
  setClasses,
  addClass,
  updateClass,
  removeClass,
  startLoading,
  setSucceeded,
  setFailed,
  clearClasses,
} = classesSlice.actions;

// -------- Selectors (the ones your page already uses) --------
export const selectClasses = (state) => state.classes.items;
export const selectClassesStatus = (state) => state.classes.status;
export const selectClassesError = (state) => state.classes.error;

export default classesSlice.reducer;

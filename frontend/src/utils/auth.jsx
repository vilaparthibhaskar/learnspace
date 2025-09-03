// src/utils/auth.js
export function getAuth() {
  return {
    token: window.localStorage.getItem("jwt") || null,
    email: window.localStorage.getItem("email") || null,
    role:  window.localStorage.getItem("role") || null,
  };
}

import { createSlice } from "@reduxjs/toolkit"

const loadUser = () => {
  try {
    const storedUser = sessionStorage.getItem("authUser")
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    sessionStorage.removeItem("authUser")
    return null
  }
}

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: loadUser(),
    status: "idle",
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload
      state.status = "succeeded"
      state.error = null
    },
    clearUser: (state) => {
      state.currentUser = null
      state.status = "idle"
      state.error = null
    },
    setAuthStatus: (state, action) => {
      state.status = action.payload
    },
    setAuthError: (state, action) => {
      state.status = "failed"
      state.error = action.payload
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
})

export const {
  setUser,
  clearUser,
  setAuthStatus,
  setAuthError,
  clearAuthError,
} = userSlice.actions
export const selectCurrentUser = (state) => state.user.currentUser
export const selectAuthStatus = (state) => state.user.status
export const selectAuthError = (state) => state.user.error
export default userSlice.reducer
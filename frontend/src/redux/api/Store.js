import { configureStore } from "@reduxjs/toolkit"
import userReducer from "../UserSlice"

const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

store.subscribe(() => {
  const currentUser = store.getState().user.currentUser

  if (currentUser) {
    sessionStorage.setItem("authUser", JSON.stringify(currentUser))
  } else {
    sessionStorage.removeItem("authUser")
  }
})

export default store
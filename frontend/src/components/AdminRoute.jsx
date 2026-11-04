import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "../redux/UserSlice"

const AdminRoute = ({ children }) => {
  const user = useSelector(selectCurrentUser)

  if (!user) return <Navigate to="/signin" replace />
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />

  return children
}

export default AdminRoute

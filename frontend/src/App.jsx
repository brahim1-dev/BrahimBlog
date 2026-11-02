import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { Navigate, Route, Routes } from "react-router-dom"
import Blog from "./pages/Blog"
import BlogPost from "./pages/BlogPost"
import Contact from "./pages/Contact"
import CreatePost from "./pages/CreatePost"
import Dashboard from "./pages/Dashboard"
import EditPost from "./pages/EditPost"
import Home from "./pages/Home"
import PostList from "./pages/PostList"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"

const App = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<Blog />} />
          <Route path="/blogs/:id" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/posts" element={<PostList />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/edit-post/:id" element={<EditPost />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout/Layout'
import Home from './pages/Home/Home'
import { VehicleList } from './pages/VehicleList/VehicleList'
import VehicleDetail from './pages/VehicleDetail/VehicleDetail'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Profile from './pages/Profile/Profile'
import SubmissionPage from './pages/SubmissionPage/SubmissionPage'
import SubmissionsList from './pages/SubmissionsList/SubmissionsList'
import SubmissionDetail from './pages/SubmissionsList/SubmissionDetail'
import VehicleManagement from './pages/Admin/VehicleManagement/VehicleManagement'
import MentionsLegales from './pages/Legal/MentionsLegales'
import Cgu from './pages/Legal/Cgu'
import PolitiqueConfidentialite from './pages/Legal/PolitiqueConfidentialite'
import Contact from './pages/Contact/Contact'
import About from './pages/About/About'
import ProtectedRoute from './components/shared/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'vehicles', element: <VehicleList /> },
      { path: 'vehicles/:id', element: <VehicleDetail /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: 'mentions-legales', element: <MentionsLegales /> },
      { path: 'cgu', element: <Cgu /> },
      { path: 'politique-confidentialite', element: <PolitiqueConfidentialite /> },
      { path: 'contact', element: <Contact /> },
      { path: 'about', element: <About /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: 'submissions/new',
        element: <ProtectedRoute><SubmissionPage /></ProtectedRoute>,
      },
      {
        path: 'dashboard/submissions',
        element: <ProtectedRoute><SubmissionsList /></ProtectedRoute>,
      },
      {
        path: 'dashboard/submissions/:id',
        element: <ProtectedRoute><SubmissionDetail /></ProtectedRoute>,
      },
      {
        path: 'admin/vehicles',
        element: <ProtectedRoute><VehicleManagement /></ProtectedRoute>,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout/Layout'
import Home from './pages/Home/Home'
import { VehicleList } from './pages/VehicleList/VehicleList'
import VehicleDetail from './pages/VehicleDetail/VehicleDetail'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Profile from './pages/Profile/Profile'
import SubmissionPage from './pages/SubmissionPage/SubmissionPage'
import ProtectedRoute from './components/shared/ProtectedRoute'

function DashboardSubmissionsStub() {
  const { state } = useLocation()
  return <Navigate to="/dashboard" replace state={state} />
}

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
        element: <ProtectedRoute><DashboardSubmissionsStub /></ProtectedRoute>,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

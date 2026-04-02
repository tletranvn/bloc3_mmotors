import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout/Layout'
import Home from './pages/Home/Home'
import { VehicleList } from './pages/VehicleList/VehicleList'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'vehicles', element: <VehicleList /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

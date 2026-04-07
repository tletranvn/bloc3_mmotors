import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout/Layout'
import Home from './pages/Home/Home'
import { VehicleList } from './pages/VehicleList/VehicleList'
import VehicleDetail from './pages/VehicleDetail/VehicleDetail'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'vehicles', element: <VehicleList /> },
      { path: 'vehicles/:id', element: <VehicleDetail /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

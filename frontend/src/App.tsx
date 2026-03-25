import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout/Layout'
import Home from './pages/Home/Home'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {index: true, element: <Home />,},
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

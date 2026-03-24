import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout/Layout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <div className="p-8">Page d'accueil</div>,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

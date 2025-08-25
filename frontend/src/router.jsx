import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignUp';
import HomePage from './components/Home';
import ClassesPage from './components/ClassesPage';
import SubmissionsPage from './components/SubmissionsPage';
import AlertsPage from './components/AlertsPage';

const router = createBrowserRouter([
    {
        path: '/', 
        element: <LoginPage />,
      },
    {
        path:'/login',
        element: <LoginPage />
    },
    {
        path:'/signup',
        element: <SignupPage/>
    },
    {
        path:'/home',
        element: <HomePage/>
    },
    {
        path:'/classes',
        element: <ClassesPage/>
    },
    {
        path:'/submissions',
        element: <SubmissionsPage/>
    },
    {
        path:'/alerts',
        element: <AlertsPage/>
    },
]);

export default router;
import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignUp';
import HomePage from './components/Home';


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
    }
]);

export default router;
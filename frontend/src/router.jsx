import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignUp';
import HomePage from './components/Home';
import ClassesPage from './components/ClassesPage';
import SubmissionsPage from './components/SubmissionsPage';
import AlertsPage from './components/AlertsPage';
import ProfilePage from './components/ProfilePage';
import ClassLayout from "./components/ClassLayout";
import ClassHome from "./components/ClassHome";
import ClassMembers from "./components/ClassMembers";
import ClassSubmissions from "./components/ClassSubmissions";
import ClassAlerts from "./components/ClassAlerts";
import ClassAssignments from "./components/ClassAssignments";

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
    {
        path:'/profile',
        element: <ProfilePage/>
    },
    {
    path: "/classes/:classId",
    element: <ClassLayout />,
    children: [
      { index: true, element: <ClassHome /> },
      { path: "members", element: <ClassMembers /> },
      { path: "submissions", element: <ClassSubmissions /> },
      { path: "alerts", element: <ClassAlerts /> },
      {path:"assignments", element:<ClassAssignments />},
    ],
  },

]);

export default router;
import './App.css';

import HomeFeedPage from './pages/HomeFeedPage';
import NotificationsFeedPage from './pages/NotificationsFeedPage';
import UserFeedPage from './pages/UserFeedPage';
import SignupPage from './pages/SignupPage';
import SigninPage from './pages/SigninPage';
import RecoverPage from './pages/RecoverPage';
import MessageGroupsPage from './pages/MessageGroupsPage';
import MessageGroupPage from './pages/MessageGroupPage';
import ConfirmationPage from './pages/ConfirmationPage';
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://5af0533e211a46dfae208b7f2ffc21dd@o4508444987097088.ingest.de.sentry.io/4508445447684176',
  integrations: [],
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeFeedPage />
  },
  {
    path: '/notification',
    element: <NotificationsFeedPage />
  },
  {
    path: '/@:handle',
    element: <UserFeedPage />
  },
  {
    path: '/messages',
    element: <MessageGroupsPage />
  },
  {
    path: '/messages/@:handle',
    element: <MessageGroupPage />
  },
  {
    path: '/signup',
    element: <SignupPage />
  },
  {
    path: '/signin',
    element: <SigninPage />
  },
  {
    path: '/confirm',
    element: <ConfirmationPage />
  },
  {
    path: '/forgot',
    element: <RecoverPage />
  }
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
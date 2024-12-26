import './HomeFeedPage.css';
import React from "react";

import { Auth } from 'aws-amplify';

import DesktopNavigation from '../components/DesktopNavigation';
import DesktopSidebar from '../components/DesktopSidebar';
import ActivityFeed from '../components/ActivityFeed';
import ActivityForm from '../components/ActivityForm';
import ReplyForm from '../components/ReplyForm';

// [TODO] Authentication
import Cookies from 'js-cookie';
// Import the Auth module if it exists
// import Auth from 'path-to-auth-module'; // Uncomment and ensure the correct path

export default function HomeFeedPage() {
  const [activities, setActivities] = React.useState([]);
  const [popped, setPopped] = React.useState(false);
  const [poppedReply, setPoppedReply] = React.useState(false);
  const [replyActivity, setReplyActivity] = React.useState({});
  const [user, setUser] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const dataFetchedRef = React.useRef(false);
 

  const loadData = async () => {
    try {
      const backend_url = `${process.env.REACT_APP_BACKEND_URL}/api/activities/home`;
      console.log('Fetching data from:', backend_url);
      const res = await fetch(backend_url, {
        method: "GET"
      });
      let resJson = await res.json();
      console.log('Response:', resJson);
      if (res.status === 200) {
        setActivities(resJson);
      } else {
        console.log('Error:', res);
      }
    } catch (err) {
      console.log('Fetch error:', err);
    }
  };

  const checkAuth = async () => {
    Auth.currentAuthenticatedUser({
      // Optional, By default is false. 
      // If set to true, this call will send a 
      // request to Cognito to get the latest user data
      bypassCache: false 
    })
    .then((user) => {
      console.log('user',user);
      return Auth.currentAuthenticatedUser()
    }).then((cognito_user) => {
        setUser({
          display_name: cognito_user.attributes.name,
          handle: cognito_user.attributes.preferred_username
        })
    })
    .catch((err) => console.log(err));
  };
  
    // Uncomment and use if Auth module is available
    // if (Auth.isLoggedIn()) {
    //   setUser({
    //     display_name: Auth.getUserName(),
    //     handle: Auth.getUserHandle()
    //   });
    // }
  };

  React.useEffect(() => {
    // Prevents double call
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    loadData();
    checkAuth();
  }, []);

  React.useEffect(() => {
    console.log('Activities:', activities);
  }, [activities]);

  return (
    <article>
      <DesktopNavigation user={user} active={'home'} setPopped={setPopped} />
      <div className='content'>
        <ActivityForm  
          popped={popped}
          setPopped={setPopped} 
          setActivities={setActivities} 
        />
        <ReplyForm 
          activity={replyActivity} 
          popped={poppedReply} 
          setPopped={setPoppedReply} 
          setActivities={setActivities} 
          activities={activities} 
        />
        <ActivityFeed 
          title="Home" 
          setReplyActivity={setReplyActivity} 
          setPopped={setPoppedReply} 
          activities={activities} 
        />
      </div>
      <DesktopSidebar user={user} />
    </article>
  );

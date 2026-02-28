import './Profile.css';
import { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { API_BASE_URL } from '../../config.js';
import axios from 'axios';
import PostsList from '../../components/_postsList/_postsList.js';
import SearchBar from '../../components/_searchBar/_searchBar.js';
import LeftSideBar from '../../components/_leftSideBar/_leftSideBar.js';
import RightSideBar from '../../components/_rightSideBar/_rightSideBar.js';
import { FaEdit } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

function ProfilePage() {
  const { user, error } = useUser();
  const [posts, setPosts] = useState([]);
  const [mappedPosts, setMappedPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState({
    bio: 'Bio loading...',
    tags: ['', '', '']
  });
  const userName = (user?.givenName + '\'s') || 'Your';
  const fullName = user?.fullName || (user?.givenName && user?.familyName ? `${user.givenName} ${user.familyName}` : 'Not available');

  useEffect(() => {
    if (user && user.email) {
      fetchUserEvents();
      setProfileData({
        bio: user.bio || "No bio yet...",
        tags: user.favSports
      });
    }
  }, [user]);
  
    const fetchNotifications = async (events) => {
      if (!user?.email) return [];
      
      try {
        // Get all unique member emails from all events
        const allMemberEmails = new Set();
        events.forEach(post => {
          if (post.memberEmails?.length) {
            post.memberEmails.forEach(email => email && allMemberEmails.add(email));
          }
        });
        
        // Fetch names for all members
        const memberNames = {};
        await Promise.all(
          Array.from(allMemberEmails).map(async (email) => {
            if (!email) return;
            try {
              const response = await axios.get(`${API_BASE_URL}/crud/searchPlayer`, { 
                params: { email } 
              });
              memberNames[email] = response.data.fullName || email.split('@')[0];
            } catch (err) {
              console.error(`Error fetching name for ${email}:`, err);
              memberNames[email] = email.split('@')[0];
            }
          })
        );
        const userEvents = events.filter(
          post => post.organizerEmail === user?.email && 
                 post.memberEmails?.length > 1
        );
        
        const eventNotifications = [];
        userEvents.forEach(event => {
          event.memberEmails.forEach(memberEmail => {
            if (memberEmail && memberEmail !== user?.email) {
              eventNotifications.push({
                id: `${event._id}-${memberEmail}`,
                message: `${memberNames[memberEmail] || memberEmail.split('@')[0]} joined your "${event.name}" event!`
              });
            }
          });
        });
        return eventNotifications.slice(0, 10);
      } catch (err) {
        console.error('Error in fetchNotifications:', err);
        return [];
      }
    };

  const fetchUserEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/crud/eventlist`);
      setPosts(response.data);
      // Filter events joined or created by user
      const userEvents = response.data.filter(
        event => event.organizerEmail === user?.email || 
                 event.memberEmails?.includes(user?.email)
      );
      setPosts(userEvents);
      
      const newNotifications = await fetchNotifications(response.data);
      setNotifications(newNotifications);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const updateProfile = async () => {
    if (!user?.email) return;
    
    try {
      const nonEmptyTags = profileData.tags.filter(tag => tag.trim() !== '');
      if (profileData.bio == "") profileData.bio = "No bio yet...";
      const response = await axios.patch(`${API_BASE_URL}/crud/updatePlayer`, {
        email: user.email,
        bio: profileData.bio,
        favSports: nonEmptyTags
      });
      
      if (response.data === "Profile Updated") {
        if (user) {
          user.bio = profileData.bio;
          user.favSports = nonEmptyTags;
        }
        setIsEditingProfile(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update your profile. Try again.');
    }
  };

  if (error) console.log(error);

  useEffect(() => {
    const fetchNamesAndMapPosts = async () => {
      if (posts.length === 0) {
        setMappedPosts([]);
        return;
      }
      // Get all unique emails, get full name for each, map names to posts
      const emails = Array.from(new Set(
        posts.flatMap(post => [post.organizerEmail, ...(post.memberEmails || [])])
      ));
      const names = {};
      await Promise.all(emails.map(async (email) => {
        if (!email) return;
        try {
          const response = await axios.get(`${API_BASE_URL}/crud/searchPlayer`, { params: { email } });
          names[email] = {
            name: response.data.fullName || email,
            pfp: response.data.pfp || ''
          };
        } catch {
          names[email] = { name: email, pfp: '' };
        }
      }));
      const mapped = posts.map(post => ({
        ...post,
        organizerName: names[post.organizerEmail]?.name || post.organizerEmail,
        memberNames: (post.memberEmails || []).map(email => names[email]?.name || email),
        userPfp: names[post.organizerEmail]?.pfp || ''
      }));
      setMappedPosts(mapped);
    };
    fetchNamesAndMapPosts();
  }, [posts]);

  const handleCreateEvent = () => {
    setIsEditing(true);
    setCurrentPost({
      name: '',
      description: '',
      sport: '',
      date: Date.now(),
      place: '',
      organizerEmail: user?.email || '',
      memberEmails: [user?.email || ''],
      organizerName: fullName,
      capacity: user?.capacity || 5,
      userPfp: user?.pfp || ''
    });
  };

  const handlePostSubmit = async () => {
    //all fields must be filled
    if (!currentPost.name || !currentPost.description || !currentPost.sport || !currentPost.place
      || !currentPost.date || !currentPost.capacity) {
      alert('Please fill in all fields.');
      return;
    }
    else if (currentPost.capacity < 2) {
      alert('Event should have 2 or more members capacity.');
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/crud/addEvent`, currentPost);
      if (response.data == 'Event already exists') {
        alert(`Event named "${currentPost.name}" already exists.`);
        return;
      }
      fetchUserEvents && fetchUserEvents();
    } catch (err) {
      console.error('Error adding event:', err);
    }
    setIsEditing(false);
  };

 const handleQuitEvent = async (postName) => {
    if (!user?.email) {
      console.error('User not logged in');
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/crud/quit`, {
        name: postName,
        newMember: user.email
      });
      if (response.status === 200) {
        fetchUserEvents();
      }
    } catch (error) {
      console.error('Error quitting event:', error);
      if (error.response?.status === 202) {
        console.log('Event does not exist');
      }
    }
  };

  const handleNotificationsOpen = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/crud/eventlist`);
      const newNotifications = await fetchNotifications(response.data);
      setNotifications(newNotifications);
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  };

  return (
    <>
      <SearchBar userFullName={fullName} pfp={user?.pfp}/>
      <div className="content-wrapper">
        <div className="left-wrapper">
          <LeftSideBar />
        </div>
        <div className="main-content">
          <div className="user-ewrapper">
            <div className="user-wrapper">
              <div id="user-image" alt="Profile" className="profile-pic"
                style={user?.pfp ? { backgroundImage: `url(${user.pfp})` } : {}}
              ></div>
              <div id="user-content">
                <div className="username">
                  <h2>{fullName}</h2>
                </div>
                {isEditingProfile ? (
                  <div className="profile-edit-form">
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="profile-bio-input"
                      rows="3"
                    />
                    <div className="form-row details">
                      {Array(3).fill(0).map((_, index) => (
                        <input
                          key={index}
                          type="text"
                          value={profileData.tags[index] || ''}
                          onChange={(e) => {
                            const newTags = [...profileData.tags];
                            newTags[index] = e.target.value;
                            // only 3 tags
                            while (newTags.length < 3) newTags.push('');
                            setProfileData({...profileData, tags: newTags});
                          }}
                          placeholder={`Sport ${index + 1}`}
                          className="profile-tag-input"
                        />
                      ))}
                    </div>
                    <div className="form-buttons">
                      <button className="profile-save-button" onClick={updateProfile}>
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bio">
                      {profileData.bio.split('\n').map((line, i) => (
                        <div key={i}>{line || <br />}</div>
                      ))}
                    </div>
                    <div className="tags">
                      {profileData.tags
                        .filter(tag => tag.trim() !== '')
                        .slice(0, 3)
                        .map((tag, index) => (
                          <span key={index}>{tag}</span>
                        ))
                      }
                    </div>
                  </>
                )}
              </div>
              {!isEditingProfile && (<div id="user-edit" onClick={() => setIsEditingProfile(true)}> <FaEdit /> </div>)}

            </div>
          </div>
          <div className="home-buttons">
            <div className="user-post-title">
              {userName} Events
            </div>
            <div className="extra">
              <button id="createpost" onClick={handleCreateEvent}><span id="icon"><FaPlus/></span><span id="title">Create an Event</span></button>
            </div>
          </div>
          <div className="post-list">
              <PostsList
                user={user} posts={mappedPosts} isEditing={isEditing}
                setIsEditing={setIsEditing} currentPost={currentPost}
                setCurrentPost={setCurrentPost} onPostSubmit={handlePostSubmit}
                userEmail={user?.email} onQuit={handleQuitEvent}
              />
          </div>
        </div>
        <div className="right-wrapper" style={{ marginLeft: "300px" }}>
          <RightSideBar 
            notifications={notifications} 
            onNotificationsOpen={handleNotificationsOpen}
          />
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
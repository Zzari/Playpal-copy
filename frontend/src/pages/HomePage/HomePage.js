import PostsList from '../../components/_postsList/_postsList.js';
import SearchBar from '../../components/_searchBar/_searchBar.js';
import LeftSideBar from '../../components/_leftSideBar/_leftSideBar.js';
import RightSideBar from '../../components/_rightSideBar/_rightSideBar.js';
import Select from 'react-select';
import './HomePage.css';
import { FaRunning } from "react-icons/fa";
import { IoLocationSharp, IoCalendarClear } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { useState, useEffect } from 'react';
import { TbBallFootball, TbSwimming, TbBallVolleyball, TbBallBasketball } from "react-icons/tb";
import { useUser } from '../../hooks/useUser.js';
import { API_BASE_URL } from '../../config.js';
import axios from 'axios';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const { user, error } = useUser();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [mappedPosts, setMappedPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState();
  const [isEditing, setIsEditing] = useState(false);

  const sport_options = [
    { value: 'Any', label: <div className="flex-row dropdown-option"><span id="icon"><FaRunning/></span><span id="title">Any Sport</span></div>},
    { value: 'handball', label: <div className="flex-row dropdown-option"><span id="icon"><TbBallFootball/></span><span id="title">Handball</span></div>},
    { value: 'swimming', label: <div className="flex-row dropdown-option"><span id="icon"><TbSwimming/></span><span id="title">Swimming</span></div>},
    { value: 'volleyball', label: <div className="flex-row dropdown-option"><span id="icon"><TbBallVolleyball/></span><span id="title">Volleyball</span></div>},
    { value: 'basketball', label: <div className="flex-row dropdown-option"><span id="icon"><TbBallBasketball/></span><span id="title">Basketball</span></div>}
  ]
  const location_options = [
    { value: 'Any', label: <div className="flex-row dropdown-option"><span id="icon"><IoLocationSharp/></span><span id="title">Any Location</span></div>},
    { value: 'razon', label: <div className="flex-row dropdown-option"><span id="icon"><IoLocationSharp/></span><span id="title">Razon</span></div>},
    { value: 'rizal', label: <div className="flex-row dropdown-option"><span id="icon"><IoLocationSharp/></span><span id="title">Rizal </span></div>}
  ]
  const calendar_options = [
    { value: 'Any', label: <div className="flex-row dropdown-option"><span id="icon"><IoCalendarClear /></span><span id="title">Any Date/Time</span></div>},
    { value: 'today', label: <div className="flex-row dropdown-option"><span id="icon"><IoCalendarClear /></span><span id="title">Today</span></div>},
    { value: 'week', label: <div className="flex-row dropdown-option"><span id="icon"><IoCalendarClear /></span><span id="title">This Week</span></div>}
  ]
  const [selectedLocation, setSelectedLocation] = useState("Any");
  const [selectedCalendar, setSelectedCalendar] = useState("Any");
  const [selectedSport, setSelectedSport] = useState("Any");
  const [selectedSportOption, setSelectedSportOption] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async (events) => {
    if (!user?.email) return [];
    
    try {
      const allMemberEmails = new Set();
      events.forEach(post => {
        if (post.memberEmails?.length) {
          post.memberEmails.forEach(email => email && allMemberEmails.add(email));
        }
      });
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

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/crud/eventlist`);
      const events = response.data;
      setPosts(events);
      const newNotifications = await fetchNotifications(events);
      setNotifications(newNotifications);
      } catch (err) {
          console.error('Error fetching events:', err);
      }
  };
  
 if (error) console.log(error);

  // Handle sport filter from URL
  useEffect(() => {
    const sportFromUrl = searchParams.get('sport');
    if (sportFromUrl) {
      const foundOption = sport_options.find(option => 
        option.value.toLowerCase() === sportFromUrl.toLowerCase() ||
        option.props?.children[1].props.children.toLowerCase() === sportFromUrl.toLowerCase()
      );
      if (foundOption) {
        setSelectedSport(foundOption.value);
        setSelectedSportOption(foundOption);
        filterEvents('sport', foundOption);
      }
    } else {
      setSelectedSport("Any");
      setSelectedSportOption(null);
      fetchEvents();
    }
  }, [searchParams]);

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
      organizerName: user?.fullName || (user?.givenName && user?.familyName) ? `${user.givenName} ${user.familyName}` : 'Unknown',
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
      fetchEvents();
      setIsEditing(false);
    } catch (err) {
      console.error('Error adding event:', err);
    }
  };
  const handleJoinEvent = async (postName) => {
    if (!user?.email) {
      console.error('User not logged in');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/crud/join`, {
        name: postName,
        newMember: user.email
      });

      if (response.status === 200) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.name === postName
              ? { 
                  ...post, 
                  memberEmails: [...(post.memberEmails || []), user.email] 
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error joining event:', error);
      if (error.response?.status === 202) {
        console.log('User already joined this event');
      }
    }
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
        fetchEvents();
      }
    } catch (error) {
      console.error('Error quitting event:', error);
      if (error.response?.status === 202) {
        console.log('Event does not exist');
      }
    }
  };

  const filterEvents = async (filterType, selectedOption) => {
    const value = selectedOption?.value || selectedOption;
    if (filterType === 'sport') setSelectedSport(value);
    if (filterType === 'place') setSelectedLocation(value);
    if (filterType === 'datetime') setSelectedCalendar(value);
    
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get('search');
    
    const criteria = [];
    const params = {};
    if (selectedSport && selectedSport !== 'Any') {
      criteria.push('sport');
      params.sport = selectedSport;
    }
    if (selectedLocation && selectedLocation !== 'Any') {
      criteria.push('place');
      params.place = selectedLocation;
    }
    if (selectedCalendar && (selectedCalendar === 'today' || selectedCalendar === 'week')) {
      criteria.push('date');
      params.datetime = selectedCalendar;
    }
    if (searchQuery && searchQuery.trim()) {
      criteria.push('keyword');
      params.keyword = searchQuery.trim();
    }
    
    if (criteria.length === 0) {
      fetchEvents();
      return;
    }

    const queryParams = new URLSearchParams();
    criteria.forEach(criterion => {
      queryParams.append('criteria', criterion);
    });
    if (params.sport) queryParams.append('sport', params.sport);
    if (params.place) queryParams.append('place', params.place);
    if (params.datetime) queryParams.append('datetime', params.datetime);
    if (params.keyword) queryParams.append('keyword', params.keyword);
    try {
      const response = await axios.get(`${API_BASE_URL}/crud/eventsearch?${queryParams.toString()}`);
      
      if (response.data.message === "No Results.") {
        setPosts([]);
        setMappedPosts([]);
      } else {
        setPosts(response.data);
      }
    } catch (err) {
      console.error(`Error filtering by ${filterType}:`, err);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get('search');
        if (searchQuery !== null) {
      filterEvents('search', searchQuery);
    } else if (selectedSport || selectedLocation || selectedCalendar) {
      filterEvents();
    } else {
      fetchEvents();
    }
  }, [window.location.search]);

  useEffect(() => {
    updateURL();
    filterEvents('sport', selectedSport);
  }, [selectedSport]);

  useEffect(() => {
    updateURL();
    filterEvents('place', selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    updateURL();
    filterEvents('datetime', selectedCalendar);
  }, [selectedCalendar]);
  
  const updateURL = () => {
    const searchParams = new URLSearchParams();
    
    if (selectedSport && selectedSport !== 'Any') {
      searchParams.set('sport', selectedSport);
    }
    if (selectedLocation && selectedLocation !== 'Any') {
      searchParams.set('place', selectedLocation);
    }
    if (selectedCalendar && (selectedCalendar === 'today' || selectedCalendar === 'week')) {
      searchParams.set('datetime', selectedCalendar);
    }
    
    const currentSearch = new URLSearchParams(window.location.search).get('search');
    if (currentSearch) {
      searchParams.set('search', currentSearch);
    }
    
    navigate(`/home?${searchParams.toString()}`, { replace: true });
  };

  const handleSearch = (query) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    if (query && query.trim()) {
      searchParams.set('search', query.trim());
    } else {
      searchParams.delete('search');
    }
    
    if (selectedSport && selectedSport !== 'Any') {
      searchParams.set('sport', selectedSport);
    }
    if (selectedLocation && selectedLocation !== 'Any') {
      searchParams.set('place', selectedLocation);
    }
    if (selectedCalendar && (selectedCalendar === 'today' || selectedCalendar === 'week')) {
      searchParams.set('datetime', selectedCalendar);
    }
    
    navigate(`/home?${searchParams.toString()}`, { replace: true });
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
      <SearchBar 
        userFullName={user?.fullName || (user?.givenName && user?.familyName) ? `${user.givenName} ${user.familyName}` : 'Unknown'}
        pfp={user?.pfp}
        onSearch={handleSearch}
      />
      <div className="content-wrapper">
        <div className="left-wrapper">
          <LeftSideBar />
        </div>
        <div className="main-content">
          <div className="home-buttons">
            <div className="filters">
              <div className="Select-wrapper">
                  <Select id="sport"
                    className="filter"
                    options = {sport_options}
                    value = {selectedSportOption}
                    onChange = {(option) => {
                      setSelectedSport(option.value);
                      setSelectedSportOption(option);
                      if (option.value === 'Any') {
                        navigate('/home');
                      } else {
                        navigate(`/home?sport=${encodeURIComponent(option.value)}`);
                      }
                    }}
                    placeholder={<div className="flex-row dropdown-option"><span id="icon"><FaRunning/></span><span id="title">Any Sport</span></div>}
                    isSearchable={false}
                    classNamePrefix="react-select"
                  />
              </div>
              <div className="Select-wrapper">
                <Select id="place"
                  className="filter"
                  options = {location_options}
                  onChange = {(x) => setSelectedLocation(x)}
                  placeholder = {<div className="flex-row dropdown-option"><span id="icon"><IoLocationSharp/></span><span id="title">Any Location</span></div>}
                  isSearchable = {false}
                  classNamePrefix="react-select"
                />
              </div>
              <div className="Select-wrapper">
                <Select id="calendar"
                  className="filter"
                  options = {calendar_options}
                  onChange = {(x) => setSelectedCalendar(x)}
                  placeholder = {<div className="flex-row dropdown-option"><span id="icon"><IoCalendarClear /></span><span id="title">Any Date/Time</span></div>}
                  isSearchable = {false}
                  classNamePrefix="react-select"
                />
              </div>
            </div>
            <div className="extra">
                  <button id="createpost" onClick={handleCreateEvent}><span id="icon"><FaPlus/></span><span id="title">Create an Event</span></button>
            </div>
          </div>
          <div className="post-list">
            <PostsList
              posts={mappedPosts} isEditing={isEditing}
                setIsEditing={setIsEditing} currentPost={currentPost}
                setCurrentPost={setCurrentPost} onPostSubmit={handlePostSubmit}
              onJoin={handleJoinEvent} userEmail={user?.email}
              onQuit={handleQuitEvent}
            />
          </div>
        </div>
        <div className="right-wrapper" style={{marginLeft: "300px"}}>
          <RightSideBar 
            notifications={notifications} 
            onNotificationsOpen={handleNotificationsOpen}
          />
        </div>
      </div>
    </>
  );
}

export default HomePage;
import { useNavigate, useLocation } from 'react-router-dom';
import './_searchBar.css';
import { CiSearch } from "react-icons/ci";
import React, { useState, useEffect } from 'react';

function SearchBar({ userFullName, pfp, onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const searchParams = new URLSearchParams(location.search);
    if (query) {
      searchParams.set('search', query);
    } else {
      searchParams.delete('search');
    }
    
    navigate(`/home?${searchParams.toString()}`);
    
    if (onSearch) {
      onSearch(query);
    }
  };

  const goToHome = () => {
    navigate('/home');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className= "topbar-container">
      <header className= "topbar-header">
            <img src="/playpal-logo.svg"  className="logo" alt="PlayPal Logo" onClick={goToHome}/>
        <form className="searchbar" onSubmit={handleSearch}>
          <input 
            className="search" 
            placeholder="SEARCH"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            <CiSearch />
          </button>
        </form>
        <div className="profile-header" onClick={goToProfile}>
          <h3>{userFullName || 'Unknown User'}</h3>
                <div className="profile-img" 
                style={{ backgroundImage: `url(${pfp})`}}></div>
        </div>
      </header>
    </div>
  );
}

export default SearchBar;
import './Login.css';
import {FaEnvelope} from 'react-icons/fa';
import {useState, useEffect} from "react";
import { API_BASE_URL } from '../../config.js';
import React from 'react';

function Login(){
    const setIsDLSUEmail = useState(null);
    const [loading, setLoading] = useState(false);

    const login = () => {
        setLoading(true);
        window.open(`${API_BASE_URL}/auth/google`, '_self');
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    credentials: 'include'
                });

                if (res.ok) {
                    const data = await res.json();
                    const isDLSUEmail = data.isDLSUEmail;
                    console.log("Login.js", data.user);
                    //moved the creation of user data to passport.js
                    if (data.user && isDLSUEmail) {
                        setIsDLSUEmail(true);
                        window.location.href = '/home';
                    } else {
                        setIsDLSUEmail(false);
                        alert('Only DLSU emails allowed.');
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };
        // Check auth if logged in only
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code')) {
            checkAuth();
        }
    }, []);

    return (
        <div className='login-background'>
        <div className = "login-container">
            <div className = "company-area">
                <div className ="company-section">
                    <img src="/playpal-logo.svg" alt="PlayPal Logo"/>
                    <p className= "logo-text">Find Your Fit. Play with Pals</p>
                </div>
            </div>
            <div className = "form-area">
                <div className = "login-form">
                    <h2>Log In</h2>
                    <p>
                    Log in with your DLSU Google account to proceed with 
                    your access to PlayPal.
                    </p>
                        <button className={`google-login-button ${loading ? 'loading' : ''}`} onClick={login} disabled={loading}>
                            <FaEnvelope size="1.5em" className='mailicon'/>
                            <span>{loading ? 'Checking email...' : 'Log In with DLSU Google Account'}</span>
                        </button>
                    <p>
                        By continuing, you agree to follow the guidelines outlined in the <a href="https://www.dlsu.edu.ph/wp-content/uploads/pdf/osa/student-handbook.pdf">DLSU Student Handbook</a> and Privacy Policy of PlayPal.
                    </p>
                </div>
            </div>
        </div>
        </div>
    );

}

export default Login;
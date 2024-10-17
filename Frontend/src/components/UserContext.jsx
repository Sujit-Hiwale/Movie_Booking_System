import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
const UserContext = createContext(null);
axios.defaults.withCredentials = true;
export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    const fetchUser = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/check_auth');
            console.log('Response data:', response.data);
            setCurrentUser(response.data.user);
        } catch (error) {
            if (error.response) {
                console.error('Server responded with a status:', error.response.status);
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up the request:', error.message);
            }
        }
    };
    
    

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={currentUser}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);

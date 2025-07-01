// src/components/UserContext.js
import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userdetails, setUserDetails] = useState(null);
    const [userprofiledata, setUserProfileData] = useState();

    return (
        <UserContext.Provider value={{ userdetails, setUserDetails, userprofiledata, setUserProfileData }}>
            {children}
        </UserContext.Provider>
    );
};

import React, { createContext, useState, useContext } from 'react';

// Create context
const ViewLikeProfiles = createContext();

// Create the provider component
export const ViewLikeProvider = ({ children }) => {

    const [profileViewCount, setProfileViewCount] = useState(0);

    const updateProfileViewCount = (count) => setProfileViewCount(count);
    // console.log('profile view count isss?????????', profileViewCount);


    return (
        <ViewLikeProfiles.Provider
            value={{
                profileViewCount,
                updateProfileViewCount,
            }}
        >
            {children}
        </ViewLikeProfiles.Provider>
    );
};

// Custom hook to use notification context
export const useLikeandViewProfile = () => useContext(ViewLikeProfiles);

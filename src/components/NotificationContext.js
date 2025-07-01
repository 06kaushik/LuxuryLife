import React, { createContext, useState, useContext } from 'react';

// Create context
const NotificationContext = createContext();

// Create the provider component
export const NotificationProvider = ({ children }) => {
    const [messageCount, setMessageCount] = useState(0);
    const [profileViewCount, setProfileViewCount] = useState(0);

    // Function to update message count
    const updateMessageCount = (count) => setMessageCount(count);
    // console.log('messsage count isss?????????', messageCount);

    const updateProfileViewCount = (count) => setProfileViewCount(count);
    // console.log('like counttttt', profileViewCount);


    return (
        <NotificationContext.Provider
            value={{
                messageCount,
                profileViewCount,
                updateMessageCount,
                updateProfileViewCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use notification context
export const useNotifications = () => useContext(NotificationContext);

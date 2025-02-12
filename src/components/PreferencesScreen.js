import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, FlatList, ScrollView, TextInput, Dimensions } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import images from "./images";
import Modal from "react-native-modal";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Geolocation from '@react-native-community/geolocation';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';



const { width } = Dimensions.get("window");

const PreferencesScreen = ({ navigation }) => {

    const [savedFilters, setSavedFilters] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [locations, setLocations] = useState(["Other Location"]);
    const [isOtherLocationSelected, setIsOtherLocationSelected] = useState(false); // Track if Othe
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [showSearch, setShowSearch] = useState(true);
    const [distanceRange, setDistanceRange] = useState([0, 100]);
    const [ageRange, setAgeRange] = useState([18, 40]);
    const [selectedOptions, setSelectedOptions] = useState({
        "ID Verified": false,
        "Premium": false,
        "Unviewed": false,
        "Viewed Me": false,
        "Favorited Me": false,
        "Photos": false,
        "Online Now": false
    });
    const [selectedTags, setSelectedTags] = useState([]);
    const [isSeekingVisible, setIsSeekingVisible] = useState(false);
    const [bodytype, setBodyType] = useState(false);
    const [selectedBodyTypes, setSelectedBodyTypes] = useState([]);
    const [verificationvisible, setVerificationVisible] = useState(false)
    const [verificationtoggle, setVerificationToggle] = useState([])
    const [isLevelVisible, setIsLevelVisible] = useState(false)
    const [leveltoggle, setLevelToggle] = useState([])
    const [isEthnicityVisible, setIsEthnicityVisible] = useState(false)
    const [ethnicitytoggle, setEthnicityToggle] = useState([])
    const [isHeightVisible, setIsHeightVisible] = useState(false)
    const [height, setHeight] = useState([137, 213]);
    const [isSmokeVisible, setIsSmokeVisible] = useState(false)
    const [smoketoggle, setSmokeToggle] = useState([])
    const [IsDrinkingVisible, setIsDrinkingVisible] = useState(false)
    const [drinkingtoggle, setDrinkingToggle] = useState([])
    const [IsRelationVisible, setIsRelationVisible] = useState(false)
    const [relationtoggle, setRelationToggle] = useState([])
    const [IsEducationVisible, setIsEducationVisible] = useState(false)
    const [educationtoggle, setEducationToggle] = useState([])
    const [IsChildrenVisible, setIsChildrenVisible] = useState(false)
    const [childrentoggle, setChildrenToggle] = useState([])
    const [IsLanguageVisible, setIsLanguageVisible] = useState(false)
    const [languagetoggle, setLanguageToggle] = useState([])
    const [IsSavedFilter, setIsSavedFilter] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchName, setSearchName] = useState("");
    const [isLoading1, setIsLoading1] = useState(false);
    const [searchcity, setSearchCity] = useState('')
    const [suggestions, setSuggestions] = useState([]);
    const [userdetails, setUserDetails] = useState(null)
    const [selectedLocation, setSelectedLocation] = useState('')




    const mapToApiFormat = (selectedOptions) => {
        return {
            favorited_me: selectedOptions["Favorited Me"],
            id_verified: selectedOptions["ID Verified"],
            online_now: selectedOptions['Online Now'],
            photos: selectedOptions["Photos"],
            premium: selectedOptions["Premium"],
            unviewed: selectedOptions["Unviewed"],
            viewed_me: selectedOptions["Viewed Me"]
        };
    };

    // When you're ready to send the data to the API
    const apiData = mapToApiFormat(selectedOptions);



    useEffect(() => {
        if (searchcity.length >= 3) {
            fetchLocationSuggestions(searchcity);
        } else {
            setSuggestions([])
        }
    }, [searchcity]);


    const fetchLocationSuggestions = async (query) => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=AIzaSyBMSu3-s9hl4tDatsaEcTXC5Ul-IEP5J_E`
            );
            const results = response.data.results;
            if (results.length > 0) {
                setSuggestions(results);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleSuggestionPress = (item) => {
        const selectedCity = item.formatted_address.split(',')[0];
        const latitude = item.geometry.location.lat;
        const longitude = item.geometry.location.lng;

        setSearchCity(selectedCity);
        setSuggestions([]);
        setLocation(selectedCity);
        setSelectedLocation({
            city: selectedCity,
            latitude: latitude,
            longitude: longitude
        });
    };




    const handleRadioSelection = (selectedLoc) => {
        if (selectedLoc === "Other Location") {
            setIsOtherLocationSelected(true);
            setLocation(""); // Clear TextInput when "Other Location" is selected
            setSearchCity(""); // Reset the search input
            setSelectedLocation(null); // Reset selected location
        } else {
            setIsOtherLocationSelected(false);
            setLocation(userdetails?.city); // Reset to user's original city
            setSelectedLocation({
                city: userdetails?.city,
                latitude: userdetails?.location.coordinates[1],
                longitude: userdetails?.location.coordinates[0]
            });
        }
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const data = await AsyncStorage.getItem('UserData');
                if (data !== null) {
                    const parsedData = JSON.parse(data);
                    setUserDetails(parsedData);
                    setLocation(parsedData.city); // Set the default location to user’s city
                    setSelectedLocation({
                        city: parsedData.city,
                        latitude: parsedData.location.coordinates[1],
                        longitude: parsedData.location.coordinates[0]
                    });
                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };
        fetchUserDetails();
        getUserSearch()
    }, []);

    const getUserSearch = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        try {
            const resp = await axios.get('home/get-user-filter', { headers });
            const filters = resp.data.data || [];
            const validFilters = filters.filter(filter => filter.filterName && filter.filterName.trim() !== "");
            setSavedFilters(validFilters);
            // console.log('Saved filters:', JSON.stringify(validFilters));
        } catch (error) {
            console.log('Error from get search', error.response?.data?.message);
        }
    };

    const updateUserSearch = async (userId) => {
        console.log('iddd to updatee', userId);

        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            type: "UPSERT_FILTER",
            filterName: searchName,
            userNameSearchText: userdetails?.userName,
            otherLocation: isOtherLocationSelected,
            maxDistance: distanceRange[1],
            location: {
                longitude: selectedLocation?.longitude || userdetails?.location?.coordinates[0],
                latitude: selectedLocation?.latitude || userdetails?.location?.coordinates[1],
                city: selectedLocation?.city || userdetails?.city,
                state: selectedLocation?.state || userdetails?.state,
                country: selectedLocation?.country || userdetails?.country,
            },
            options: apiData,
            memberSeeking: selectedTags,
            hobbies: [],
            bodyType: selectedBodyTypes,
            verification: verificationtoggle,
            ethnicity: ethnicitytoggle,
            languages: languagetoggle,
            tall: {
                min: height[0],
                max: height[1]
            },
            smoking: smoketoggle,
            drinking: drinkingtoggle,
            relationshipStatus: relationtoggle,
            children: childrentoggle,
            education: educationtoggle,
            workField: [],
            levels: leveltoggle,
            profileText: "",
            ageRange: {
                min: ageRange[0],
                max: ageRange[1]
            },
            gender: userdetails?.preferences?.gender
        }
        try {
            const resp = await axios.put(`home/update-user-filter/${userId}`, body, { headers })
            console.log('response of update user search', resp.data);
            setIsModalVisible(false);
        } catch (error) {
            console.log('error from the user search', error.response.data.message);
        }
    }

    const handleDeleteFilter = async (id) => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        try {
            const resp = await axios.delete(`home/delete-user-filter/${id}`, { headers })
            console.log('response from the delete api filter', resp.data);
            getUserSearch()
        } catch (error) {
            console.log('error from the delete filter api', error);
        }
    }

    const saveUserSearch = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        let body = {
            type: "UPSERT_FILTER",
            filterName: searchName,
            userNameSearchText: userdetails?.userName,
            otherLocation: isOtherLocationSelected,
            maxDistance: distanceRange[1],
            location: {
                longitude: selectedLocation?.longitude || userdetails?.location?.coordinates[0],
                latitude: selectedLocation?.latitude || userdetails?.location?.coordinates[1],
                city: selectedLocation?.city || userdetails?.city,
                state: selectedLocation?.state || userdetails?.state,
                country: selectedLocation?.country || userdetails?.country,
            },
            options: apiData,
            memberSeeking: selectedTags,
            hobbies: [],
            bodyType: selectedBodyTypes,
            verification: verificationtoggle,
            ethnicity: ethnicitytoggle,
            languages: languagetoggle,
            tall: {
                min: height[0],
                max: height[1]
            },
            smoking: smoketoggle,
            drinking: drinkingtoggle,
            relationshipStatus: relationtoggle,
            children: childrentoggle,
            education: educationtoggle,
            workField: [],
            levels: leveltoggle,
            profileText: "",
            ageRange: {
                min: ageRange[0],
                max: ageRange[1]
            },
            gender: userdetails?.preferences?.gender
        }
        console.log('body of saved filter', body);

        try {
            const resp = await axios.post('home/save-user-filter', body, { headers })
            console.log('resonse from save filter', resp.data);
            getUserSearch();
            setIsModalVisible(false);
        } catch (error) {
            console.log('error from the save filters', error.response.data.message);
        }
    }

    const handleFilterSelection = (filter) => {
        setSearchName(filter?.filterName)
        setSelectedFilter(filter);
        const savedTags = filter.memberSeeking || [];
        setSelectedTags(savedTags);
        const savedBodyTypes = filter.bodyType || [];
        setSelectedBodyTypes(savedBodyTypes);
        const savedVerification = filter.verification || [];
        setVerificationToggle(savedVerification)
        const savedLevels = filter.levels || []
        setLevelToggle(savedLevels)
        const savedEthnicity = filter.ethnicity || []
        setEthnicityToggle(savedEthnicity)
        const savedHeight = filter.height ? [filter.height.min, filter.height.max] : [137, 213];
        setHeight(savedHeight);
        const savedSmoking = filter.smoking || []
        setSmokeToggle(savedSmoking)
        const savedDrink = filter.drinking || []
        setDrinkingToggle(savedDrink)
        const savedRelation = filter.relationshipStatus || []
        setRelationToggle(savedRelation)
        const savedEducation = filter.education || []
        setEducationToggle(savedEducation)
        const savedChildren = filter.children || []
        setChildrenToggle(savedChildren)
        const savedLanguage = filter.languages || []
        setLanguageToggle(savedLanguage)
        const savedAge = filter.ageRange ? [filter.ageRange.min, filter.ageRange.max] : [18, 60]
        setAgeRange(savedAge)
        const options = filter.options || {};
        setSelectedOptions({
            "ID Verified": options.id_verified || false,
            "Premium": options.premium || false,
            "Unviewed": options.unviewed || false,
            "Viewed Me": options.viewed_me || false,
            "Favorited Me": options.favorited_me || false,
            "Photos": options.photos || false,
            "Online Now": options.online_now || false,
        });
        const maxDistance = filter.maxDistance || 100;
        setDistanceRange([0, maxDistance]);
        if (filter.otherLocation === "true") {
            setIsOtherLocationSelected(true);
            setSearchCity(filter.location.city);
            setLocation(filter.location.city);
            setSelectedLocation({
                city: filter.location.city,
                state: filter.location.state,
                country: filter.location.country,
                latitude: filter.location.latitude,
                longitude: filter.location.longitude,
            });
        } else {
            setIsOtherLocationSelected(false);
            setLocation(userdetails?.city);
            setSelectedLocation({
                city: userdetails?.city,
                latitude: userdetails?.location.coordinates[1],
                longitude: userdetails?.location.coordinates[0],
            });
        }
    };

    const getSearch = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token,
        };
        const locationData = selectedLocation || {
            city: userdetails?.city,
            latitude: userdetails?.location.coordinates[1],
            longitude: userdetails?.location.coordinates[0]
        };
        let body = {
            where: {
                userNameSearchText: "",
                currentCity: location,
                otherLocation: isOtherLocationSelected,
                maxDistance: distanceRange[1],
                location: {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                    city: locationData.city
                },
                options: apiData,
                memberSeeking: selectedTags,
                hobbies: [],
                bodyType: selectedBodyTypes,
                verification: verificationtoggle,
                ethnicity: ethnicitytoggle,
                tall: {
                    min: height[0],
                    max: height[1]
                },
                smoking: smoketoggle,
                drinking: drinkingtoggle,
                relationshipStatus: relationtoggle,
                children: childrentoggle,
                education: educationtoggle,
                workField: [],
                levels: leveltoggle,
                languages: languagetoggle,
                profileText: "",
                ageRange: {
                    min: ageRange[0],
                    max: ageRange[1]
                },
                gender: userdetails?.preferences?.gender
            },
            requestType: "mobile",
            pageLength: 11,
            currentPage: 0,
            autopopulate: true
        }
        // console.log('body of preferece', body);

        try {
            const resp = await axios.post('home/search', body, { headers })
            // console.log('response from the get search api', resp?.data);
            await AsyncStorage.setItem('dashboardData', JSON.stringify(body));
            navigation.goBack('')
        } catch (error) {
            console.log('error from the get search api', error.response.data.message);
        }
    }

    const toggleModal = () => {
        setIsModalVisible((prev) => !prev);
    };

    const handleSaveSearch = () => {
        if (searchName.trim()) {
            saveUserSearch();
        } else {
            alert('Please enter a name for the filter');
        }
    };

    const toggleOption = (option) => {
        setSelectedOptions((prevOptions) => ({
            ...prevOptions,  // Copy the previous options
            [option]: !prevOptions[option],  // Toggle the selected option (true/false)
        }));
    };

    const bodyTypeToggle = (option) => {
        setSelectedBodyTypes((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    };


    const toggleVerification = (option) => {
        setVerificationToggle((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    }

    const toggleLevel = (option) => {
        setLevelToggle((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    }

    const toggleEthnicity = (option) => {
        setEthnicityToggle((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    }

    const toggleSmoke = (option) => {
        setSmokeToggle((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    }

    const toggleDrinking = (option) => {
        setDrinkingToggle((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    }

    const toggleRelation = (option) => {
        setRelationToggle((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    }

    const toggleEducation = (option) => {
        setEducationToggle((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    }

    const toggleChildren = (option) => {
        setChildrenToggle((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    }

    const toggleLanguage = (option) => {
        setLanguageToggle((prev) => {
            if (prev.includes(option)) {
                // If option is already selected, remove it
                return prev.filter((item) => item !== option);
            } else {
                // If option is not selected, add it
                return [...prev, option];
            }
        });
    }

    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const toggleSeekingVisibility = () => {
        setIsSeekingVisible((prev) => !prev);
    };

    const toggleBodyType = () => {
        setBodyType((prev) => !prev);
    };

    const toggleverivisible = () => {
        setVerificationVisible((prev) => !prev);
    };

    const toggleLevelvisible = () => {
        setIsLevelVisible((prev) => !prev)
    }

    const toggleethnicityvisible = () => {
        setIsEthnicityVisible((prev) => !prev)
    }

    const toggleHeightvisible = () => {
        setIsHeightVisible((prev) => !prev)
    }

    const toggleSmokevisible = () => {
        setIsSmokeVisible((prev) => !prev)
    }

    const toggleDrinkingvisible = () => {
        setIsDrinkingVisible((prev) => !prev)
    }

    const toggleRelationvisible = () => {
        setIsRelationVisible((prev) => !prev)
    }

    const toggleEducationvisible = () => {
        setIsEducationVisible((prev) => !prev)
    }

    const toggleChildrenvisible = () => {
        setIsChildrenVisible((prev) => !prev)
    }

    const toggleLanguagevisible = () => {
        setIsLanguageVisible((prev) => !prev)
    }

    const toggleSavedFiltervisible = () => {
        setIsSavedFilter((prev) => !prev)
    }


    return (
        <View style={styles.main}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={images.back} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.headerText}>PREFERENCE</Text>
                <Image source={images.menu} style={[styles.icon, { tintColor: '#BF8500' }]} />
            </View>


            <ScrollView style={styles.content}>
                {savedFilters.length > 0 ?
                    <TouchableOpacity style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>SAVED FILTERS</Text>
                    </TouchableOpacity>
                    :
                    null}
                {savedFilters.length > 0 && (
                    <FlatList
                        data={savedFilters}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.filterOption}
                                onPress={() => handleFilterSelection(item)}
                            >
                                <View style={styles.checkboxContainer}>
                                    {selectedFilter?._id === item._id && (
                                        <View style={styles.selectedCheckbox} />
                                    )}
                                </View>
                                <Text style={styles.filterName}>{item.filterName}</Text>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteFilter(item._id)}
                                >
                                    <Image
                                        source={images.delete}  // Use the delete image here
                                        style={styles.deleteIcon}  // Add style for the icon
                                    />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    />
                )}

                {/* Location */}
                <Text style={styles.sectionTitle}>LOCATION</Text>
                <View style={styles.radioGroup}>
                    <TouchableOpacity onPress={() => handleRadioSelection(userdetails?.city)}>
                        <View style={styles.radioButton}>
                            <View style={[styles.radioCircle, location === userdetails?.city && styles.selectedCircle]}>
                                {location === userdetails?.city && <View style={styles.innerCircle} />}
                            </View>
                            <Text style={styles.radioText}>{userdetails?.city}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleRadioSelection("Other Location")}>
                        <View style={styles.radioButton}>
                            <View style={[styles.radioCircle, isOtherLocationSelected && styles.selectedCircle]}>
                                {isOtherLocationSelected && <View style={styles.innerCircle} />}
                            </View>
                            <Text style={styles.radioText}>Other Location</Text>
                        </View>
                    </TouchableOpacity>
                </View>


                {/* Search Box */}

                {isOtherLocationSelected && (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchBox}
                            placeholder="Search your city here"
                            placeholderTextColor={'#7B7B7B'}
                            onChangeText={setSearchCity}
                            value={searchcity}
                        />
                    </View>
                )}

                {searchcity.length >= 3 && !isLoading && suggestions.length > 0 && (
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
                                <Text style={styles.suggestionText}>{item.formatted_address}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}

                {/* Loading indicator */}
                {isLoading && <Text>Loading...</Text>}
                <Text style={styles.sectionTitle}>MAXIMUM DISTANCE</Text>
                <Text style={styles.sliderLabel}>{distanceRange[0]} - {distanceRange[1]} miles</Text>
                <MultiSlider
                    values={distanceRange}
                    sliderLength={width * 0.8}
                    onValuesChange={(values) => setDistanceRange(values)}
                    min={0}
                    max={150}
                    step={10}
                    snapped
                    trackStyle={{
                        height: 6,
                    }}
                    selectedStyle={{ backgroundColor: "#5F3D23" }}
                    unselectedStyle={{ backgroundColor: "#E0E0E0" }}
                    customMarker={() => <View style={styles.markerStyle} />}
                />

                {/* Options */}
                <Text style={styles.sectionTitle}>OPTIONS</Text>
                <View style={styles.optionsGrid}>
                    {["ID Verified", "Premium", "Unviewed", "Viewed Me", "Favorited Me", "Photos", "Online Now",].map((option) => (
                        <TouchableOpacity
                            key={option}
                            onPress={() => toggleOption(option)}
                            style={[
                                styles.option,
                                selectedOptions[option] && styles.optionSelected,
                            ]}
                        >
                            <View style={styles.checkboxContainer}>
                                {selectedOptions[option] && <Text style={styles.tickMark}>✔</Text>}
                            </View>
                            <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Age Slider */}
                <Text style={styles.sectionTitle}>AGE</Text>
                <Text style={styles.sliderLabel}>
                    {ageRange[0]} - {ageRange[1] === 60 ? "60+" : ageRange[1]}
                </Text>
                <MultiSlider
                    values={ageRange}
                    sliderLength={width * 0.8}
                    onValuesChange={(values) => setAgeRange(values)}
                    min={18}
                    max={60}
                    step={1}
                    snapped
                    selectedStyle={{ backgroundColor: "#5F3D23" }}
                    trackStyle={{
                        height: 6,
                    }}
                    unselectedStyle={{ backgroundColor: "#E0E0E0" }}
                    customMarker={() => <View style={styles.markerStyle} />}
                />

                {/* Show Members Seeking */}
                <TouchableOpacity onPress={toggleSeekingVisibility} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>SHOW MEMBERS SEEKING</Text>
                    <Image
                        source={isSeekingVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {isSeekingVisible && (
                    <View style={styles.tagContainer}>
                        {[
                            "True Love", "Luxury lifestyle", "Active lifestyle", "Flexible schedule", "Emotional connection",
                            "All ethnicities", "Attentive", "Discretion", "Fine dining", "Friends", "Investor", "Life of leisure",
                            "Long-term", "Marriage minded", "Mentorship", "Monogamous", "No strings attached", "Non-monogamous",
                            "Open relationship", "Passport ready", "Platonic", "Romance", "Seeking trans-friendly",
                            "Seeking transgender", "Shows & entertainment", "Travel to you", "Travel with you", "Vacations",
                        ].map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                                onPress={() => toggleTag(tag)}
                            >
                                <Text style={styles.tagText}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={toggleBodyType} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>BODY TYPE</Text>
                    <Image
                        source={bodytype ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {bodytype && (
                    <View style={styles.optionsGrid}>
                        {["Slim", "Athletic", "Average", "Heavy"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => bodyTypeToggle(option)}
                                style={[
                                    styles.option,
                                    selectedBodyTypes.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {selectedBodyTypes.includes(option) && <Text style={styles.tickMark}>✔</Text>}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={toggleverivisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>VERIFICATION</Text>
                    <Image
                        source={verificationvisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {verificationvisible && (
                    <View>
                        {["Verified", "Not Verified"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => toggleVerification(option)}
                                style={[
                                    styles.option,
                                    verificationtoggle.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {verificationtoggle.includes(option) && <Text style={styles.tickMark}>✔</Text>}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={toggleethnicityvisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>ETHNICITY</Text>
                    <Image
                        source={isEthnicityVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {isEthnicityVisible && (
                    <View>
                        {["Asian", "Black / African Descent", "Latin / Hispanic", "East Indian", "Middle Eastern", "Mixed", "Pacific Islander", "White / Caucasian", "Other"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => toggleEthnicity(option)}
                                style={[
                                    styles.option,
                                    ethnicitytoggle.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {ethnicitytoggle.includes(option) && <Text style={styles.tickMark}>✔</Text>}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={toggleHeightvisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>HEIGHT</Text>
                    <Image
                        source={isHeightVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {isHeightVisible && (
                    <View>
                        <Text style={styles.sliderLabel}>{height[0]}cm - {height[1]}cm</Text>
                        <MultiSlider
                            values={height}
                            sliderLength={width * 0.9}
                            onValuesChange={(values) => setHeight(values)}
                            min={0}
                            max={1000}
                            step={10}
                            snapped
                            trackStyle={{
                                height: 6,
                            }}
                            selectedStyle={{ backgroundColor: "#5F3D23" }}
                            unselectedStyle={{ backgroundColor: "#E0E0E0" }}
                            customMarker={() => <View style={styles.markerStyle} />}
                        />
                    </View>
                )}
                <TouchableOpacity onPress={toggleSmokevisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>SMOKING</Text>
                    <Image
                        source={isSmokeVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {isSmokeVisible && (
                    <View>
                        {["Non Smoker", "Light Smoker", "Heavy Smoker"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => toggleSmoke(option)}
                                style={[
                                    styles.option,
                                    smoketoggle.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {smoketoggle.includes(option) && <Text style={styles.tickMark}>✔</Text>}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={toggleDrinkingvisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>DRINKING</Text>
                    <Image
                        source={IsDrinkingVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {IsDrinkingVisible && (
                    <View>
                        {["Non Drinker", "Social Drinker", "Heavy Drinker"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => toggleDrinking(option)}
                                style={[
                                    styles.option,
                                    drinkingtoggle.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {drinkingtoggle.includes(option) && <Text style={styles.tickMark}>✔</Text>}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={toggleRelationvisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>RELATIONSHIP STATUS</Text>
                    <Image
                        source={IsRelationVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {IsRelationVisible && (
                    <View>
                        {["Single", "Sepetated", "Open", "Divorced", "Widowed", "Married"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => toggleRelation(option)}
                                style={[
                                    styles.option,
                                    relationtoggle.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {relationtoggle.includes(option) && <Text style={styles.tickMark}>✔</Text>}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={toggleEducationvisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>EDUCATION</Text>
                    <Image
                        source={IsEducationVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {IsEducationVisible && (
                    <View>
                        {["High School", "Some College", "Associates Degree", "Bachelors Degree", "Graduate Degree", "PhD / Post Doctoral", "MD / Medical Doctor", "JD / Attorney"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => toggleEducation(option)}
                                style={[
                                    styles.option,
                                    educationtoggle.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {educationtoggle.includes(option) && <Text style={styles.tickMark}>✔</Text>}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={toggleChildrenvisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>CHILDREN</Text>
                    <Image
                        source={IsChildrenVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {IsChildrenVisible && (
                    <View>
                        {["Yes", "No", "Prefer Not To Say"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => toggleChildren(option)}
                                style={[
                                    styles.option,
                                    childrentoggle.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {childrentoggle.includes(option) && <Text style={styles.tickMark}>✔</Text>}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={toggleLanguagevisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>LANGUAGE</Text>
                    <Image
                        source={IsLanguageVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {IsLanguageVisible && (
                    <View>
                        {["English", "Espanol", "Francais", "Deutsh", "Nederlandse", "Portugues"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => toggleLanguage(option)}
                                style={[
                                    styles.option,
                                    languagetoggle.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {languagetoggle.includes(option) && <Text style={styles.tickMark}>✔</Text>}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}


            </ScrollView>


            <View style={styles.cont}>
                <View style={styles.cont1}>
                    <Text style={styles.txt1}>Reset</Text>
                </View>
                {selectedFilter === null ?
                    <TouchableOpacity style={[styles.cont1, { width: '40%' }]} onPress={toggleModal}>
                        <Text style={styles.txt1}>Save Search</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={[styles.cont1, { width: '40%' }]} onPress={toggleModal}>
                        <Text style={styles.txt1}>Update Search</Text>
                    </TouchableOpacity>
                }

                <TouchableOpacity style={[styles.cont1, { width: '30%', backgroundColor: '#916008', borderColor: '#E0E2E9', }]} onPress={() => getSearch()}>
                    <Text style={[styles.txt1, { color: 'white' }]}>Apply</Text>
                </TouchableOpacity>
            </View>

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
                onBackButtonPress={toggleModal}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Name this Search</Text>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Enter a name"
                        placeholderTextColor={'#7C7C7C'}
                        value={searchName}
                        onChangeText={setSearchName}
                    />
                    {selectedFilter === null ?
                        <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveSearch}>
                            <Text style={styles.modalSaveText}>Save</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={styles.modalSaveButton} onPress={() => updateUserSearch(selectedFilter?._id)}>
                            <Text style={styles.modalSaveText}>Update</Text>
                        </TouchableOpacity>
                    }
                </View>
            </Modal>
        </View>
    );
};

export default PreferencesScreen;

const styles = StyleSheet.create({

    main: { flex: 1, backgroundColor: "white" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
    headerText: { fontSize: 20, color: "black" },
    icon: { width: 20, height: 20 },
    content: { paddingHorizontal: 20 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#916008", marginVertical: 20 },
    searchContainer: { position: "relative", marginBottom: 10, marginTop: 10, },
    searchBox: { borderWidth: 1, borderColor: "#E8E6EA", borderRadius: 15, paddingLeft: 20, paddingRight: 35 },
    searchIcon: { position: "absolute", right: 10, top: "50%", transform: [{ translateY: -10 }], height: 20, width: 20 },
    sliderLabel: { fontSize: 14, color: "gray", marginVertical: 5 },
    radioGroup: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20,
        marginBottom: 10,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#916008",
        justifyContent: "center",
        alignItems: "center",
    },
    selectedCircle: {
        backgroundColor: "#916008",
    },
    innerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    radioText: {
        marginLeft: 10,
        fontSize: 14,
        color: "#5F6368",
    },

    optionsGrid: { flexDirection: "row", flexWrap: "wrap" },
    option: { flexDirection: "row", alignItems: "center", marginBottom: 10, width: "48%" },
    // optionSelected: { backgroundColor: "#916008" },
    checkboxContainer: { width: 20, height: 20, borderWidth: 2, borderColor: "#ABABAB", justifyContent: "center", alignItems: "center", borderRadius: 4 },
    tickMark: { color: "#916008", fontSize: 12, fontWeight: "bold", bottom: 2 },
    optionText: { fontSize: 14, color: "#5F6368", marginLeft: 10 },
    markerStyle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        backgroundColor: '#5F3D23',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    tagContainer: { flexDirection: "row", flexWrap: "wrap" },
    tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, margin: 5, backgroundColor: "#f2f2f2" },
    tagSelected: { backgroundColor: "#916008" },
    tagText: { color: "black", fontSize: 12 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginRight: 8 },
    cont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 20,
        marginRight: 20,
        marginTop: 20, bottom: 10
        // marginBottom:30
        // alignSelf: 'center'
    },
    cont1: {
        borderWidth: 1,
        height: 44,
        width: '20%',
        borderColor: '#E0E2E9',
        borderRadius: 8,
        justifyContent: 'center'

    },
    txt1: {
        color: 'black',
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
        textAlign: "center"
    },
    modal: {
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#916008",
        marginBottom: 15,
    },
    modalInput: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#E8E6EA",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        color: 'black'
    },
    modalSaveButton: {
        backgroundColor: "#916008",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    modalSaveText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    suggestionText: {
        fontSize: 16,
    },
    txt: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    filterOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#916008",
        justifyContent: "center",
        alignItems: "center",
        bottom: 1
    },
    selectedCheckbox: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#916008",
    },
    filterName: {
        marginLeft: 12,
        fontSize: 16,
        color: "#5F3D23",
        fontFamily: 'Poppins-Medium',
    },
    deleteButton: {
        marginLeft: 'auto',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    deleteIcon: {
        width: 18,
        height: 18,
        tintColor: "black",
    },
});

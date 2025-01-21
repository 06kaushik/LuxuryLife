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


    const [locations, setLocations] = useState(["Other Location"]);
    const [location, setLocation] = useState(null);
    const [isOtherLocation, setIsOtherLocation] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const [distanceRange, setDistanceRange] = useState([0, 100]);
    const [ageRange, setAgeRange] = useState([18, 60]);
    const [selectedOptions, setSelectedOptions] = useState([]);
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
    const [selectedlocation, setSelectedLocation] = useState('')


    useEffect(() => {
        if (searchcity.length >= 3) {
            fetchLocationSuggestions(searchcity);
        } else {
            setSuggestions([])
        }
    }, [searchcity]);

    const fetchLocationSuggestions = async (query) => {
        setIsLoading1(true);
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=AIzaSyBMSu3-s9hl4tDatsaEcTXC5Ul-IEP5J_E`
            );
            const results = response.data.results;
            console.log('resultt', JSON.stringify(results));
            if (results.length > 0) {
                // Extract necessary data from the first result
                const locationData = results[0];
                const addressComponents = locationData.address_components;

                // Helper function to extract specific types (city, state, country)
                const getAddressComponent = (type) =>
                    addressComponents.find((component) => component.types.includes(type))?.long_name || '';

                const city = getAddressComponent('locality') || getAddressComponent('administrative_area_level_2');
                const state = getAddressComponent('administrative_area_level_1');
                const country = getAddressComponent('country');
                const latitude = locationData.geometry.location.lat;
                const longitude = locationData.geometry.location.lng;

                // Save data
                setSuggestions(results); // Update suggestions list
                console.log({
                    city,
                    state,
                    country,
                    latitude,
                    longitude,
                });

                // Optionally, store this in state or any persistent storage
                setSelectedLocation({ city, state, country, latitude, longitude });
            } else {
                setSuggestions([]); // Clear suggestions if no results
            }
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
        } finally {
            setIsLoading1(false); // End loading
        }
    };


    const handleSuggestionPress = (item) => {
        const selectedCity = item.formatted_address.split(',')[0]; // Extract the city name
        setSearchCity(selectedCity);
        setSuggestions([]);
        setLocations((prev) => [selectedCity, ...prev]); // Add the new city to the list
        setLocation(selectedCity); // Set the selected location
        setShowSearch(false); // Hide the search box
    };

    const handleRadioSelection = (selectedLoc) => {
        if (selectedLoc === "Other Location") {
            setShowSearch(true);
            setIsOtherLocation(true);
            setLocation(null);
        } else {
            setShowSearch(false);
            setIsOtherLocation(false);
            setLocation(selectedLoc); // Set the selected location
        }
    };



    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const data = await AsyncStorage.getItem('UserData');
                if (data !== null) {
                    const parsedData = JSON.parse(data);
                    setUserDetails(parsedData);
                    if (parsedData.city) {
                        setLocations([parsedData.city, "Other Location"]);
                        setLocation(parsedData.city);
                        setShowSearch(false);
                    }
                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };
        fetchUserDetails();
    }, []);

    ///////// API INTEGRATION ////////// 

    const getSearch = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token,
        };
        let body = {
            where: {
                userNameSearchText: "",
                currentCity: location,
                otherLocation: isOtherLocation ? location : null,
                maxDistance: distanceRange[1],
                location: {
                    longitude: userdetails?.location?.coordinates[0],
                    latitude: userdetails?.location?.coordinates[1],
                    city: userdetails?.city,
                    state: userdetails?.state,
                    country: userdetails?.country
                },
                options: selectedOptions,
                memberSeeking: selectedTags,
                hobbies: [],
                bodyType: selectedBodyTypes,
                verification: verificationtoggle,
                ethnicity: ethnicitytoggle,
                height: {
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
            pageLength: 11,
            currentPage: 0,
            autopopulate: true
        }
        console.log('body of preferece', body);

        try {
            // const resp = await axios.post('home/search', body, { headers })
            // console.log('response from the get search api', resp.data);
            // navigation.navigate('PreferenceTopScreen')
        } catch (error) {
            console.log('error from the get search api', error.response.data.message);
        }
    }

    const toggleModal = () => {
        setIsModalVisible((prev) => !prev);
    };

    const handleSaveSearch = () => {
        console.log("Search saved with name:", searchName);
        toggleModal();
    };

    const toggleOption = (option) => {
        setSelectedOptions((prevOptions) => {
            if (prevOptions.includes(option)) {
                return prevOptions.filter((item) => item !== option);
            } else {
                return [...prevOptions, option];
            }
        });
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

                <TouchableOpacity onPress={toggleLanguagevisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>SAVED FILTERS</Text>
                    <Image
                        source={IsSavedFilter ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {/* Location */}
                <Text style={styles.sectionTitle}>LOCATION</Text>
                {locations.length > 0 && (
                    <View style={styles.radioGroup}>
                        {locations.map((loc) => (
                            <TouchableOpacity
                                key={loc}
                                onPress={() => handleRadioSelection(loc)}
                                style={styles.radioButton}
                            >
                                <View style={styles.radioCircle}>
                                    {location === loc && <View style={styles.radioInnerCircle} />}
                                </View>
                                <Text style={styles.radioText}>{loc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Search Box */}
                {showSearch && (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchBox}
                            placeholder="Search your city here"
                            placeholderTextColor={'#7B7B7B'}
                            onChangeText={setSearchCity}
                            value={searchcity}
                        />
                        <Image source={images.search} style={styles.searchIcon} />
                    </View>
                )}
                {searchcity.length >= 3 && suggestions.length > 0 && (
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
                                <View style={styles.suggestionItem}>
                                    <Text style={styles.suggestionText}>{item.formatted_address}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
                {/* Loading indicator */}
                {isLoading1 && <Text>Loading...</Text>}

                {/* Distance Slider */}
                <Text style={styles.sectionTitle}>MAXIMUM DISTANCE</Text>
                <Text style={styles.sliderLabel}>{distanceRange[0]} - {distanceRange[1]} miles</Text>
                <MultiSlider
                    values={distanceRange}
                    sliderLength={width * 0.9}
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
                    {["ID Verified", "Premium", "Unviewed", "Viewed Me", "Favorited Me", "Photos"].map((option) => (
                        <TouchableOpacity
                            key={option}
                            onPress={() => toggleOption(option)}
                            style={[
                                styles.option,
                                selectedOptions.includes(option) && styles.optionSelected,
                            ]}
                        >
                            <View style={styles.checkboxContainer}>
                                {selectedOptions.includes(option) && <Text style={styles.tickMark}>✔</Text>}
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
                    sliderLength={width * 0.9}
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

                <TouchableOpacity onPress={toggleLevelvisible} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>LEVELS</Text>
                    <Image
                        source={isLevelVisible ? images.dropdown : images.rightarrow}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {isLevelVisible && (
                    <View>
                        {["Level 1", "Level 2", "Level 3"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => toggleLevel(option)}
                                style={[
                                    styles.option,
                                    leveltoggle.includes(option) && styles.optionSelected,
                                ]}
                            >
                                <View style={styles.checkboxContainer}>
                                    {leveltoggle.includes(option) && <Text style={styles.tickMark}>✔</Text>}
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
                <TouchableOpacity style={[styles.cont1, { width: '40%' }]} onPress={toggleModal}>
                    <Text style={styles.txt1}>Save Search</Text>
                </TouchableOpacity>
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
                    <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveSearch}>
                        <Text style={styles.modalSaveText}>Save</Text>
                    </TouchableOpacity>
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
    },
    radioInnerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#916008",
        alignSelf: "center",
    },
    radioText: {
        marginLeft: 5,
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
});

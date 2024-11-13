// WeatherApp.jsx
import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash.debounce';
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import humidity_icon from '../assets/humidity.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import rain_icon from '../assets/rain.png'
import './Weather.css'; // Ensure you have the CSS ready

// Redux slice for managing weather state
const weatherSlice = createSlice({
  name: 'weather',
  initialState: { weatherData: null },
  reducers: {
    setWeatherData: (state, action) => {
      state.weatherData = action.payload;
    },
  },
});

const { setWeatherData } = weatherSlice.actions;

// Store setup
const store = configureStore({
  reducer: {
    weather: weatherSlice.reducer,
  },
});

// Context for Dark Mode
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// Theme provider for Dark Mode
const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Main Weather component
const Weather = React.memo(() => {
  const inputRef = useRef();
  const dispatch = useDispatch();
  const weatherData = useSelector((state) => state.weather.weatherData);
  const { darkMode, toggleTheme } = useTheme();
  const [allIcons] = useState({
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  });

  const search = async (city) => {
    if (city === "") {
      alert("Enter City Name");
      return;
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      const icon = allIcons[data.weather[0].icon] || clear_icon;
      dispatch(setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: icon,
      }));
    } catch (error) {
      console.error("Error fetching weather data");
    }
  };

  const debouncedSearch = debounce((value) => search(value), 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    search("Lahore"); // Initial city load
  }, []);

  return (
    <div className={`weather ${darkMode ? 'dark' : 'light'}`}>
      <button onClick={toggleTheme} className="toggle-btn">
        Toggle {darkMode ? "Light" : "Dark"} Mode
      </button>

      <div className='search-bar'>
        <input ref={inputRef} type="text" placeholder='Search' onChange={handleSearchChange} />
        <img src={search_icon} alt="search" onClick={() => search(inputRef.current.value)} />
      </div>

      {weatherData && (
        <>
          <img src={weatherData.icon} alt="weather-icon" className='weather-icon' />
          <p className='temperature'>{weatherData.temperature}°c</p>
          <p className='location'>{weatherData.location}</p>
          <div className='weather-data'>
            <div className='col'>
              <img src={humidity_icon} alt="humidity" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className='col'>
              <img src={wind_icon} alt="wind" />
              <div>
                <p>{weatherData.windSpeed} km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// Root App Component
const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Weather />
      </ThemeProvider>
    </Provider>
  );
};

export default App;


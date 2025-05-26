import React, { useState, useEffect } from 'react';

// Constants for fare structure (Urban Red Taxi - as of July 2024 fares)
const FLAG_FALL_CHARGE = 29; // HK$
const FLAG_FALL_DISTANCE_KM = 2; // km

const INCREMENTAL_CHARGE_TIER1 = 2.1; // HK$
const INCREMENTAL_CHARGE_TIER2 = 1.4; // HK$
const TIER1_FARE_THRESHOLD = 102.5; // HK$

const INCREMENTAL_DISTANCE_UNIT_M = 200; // meters
const INCREMENTAL_WAITING_TIME_UNIT_MIN = 1; // minute

// Helper function to calculate the main fare (excluding extras)
const calculateMainFareLogic = (distanceKm, waitingTimeMin) => {
    let baseFare = 0;
    const currentDistanceKm = parseFloat(distanceKm) || 0;
    const currentWaitingTimeMin = parseFloat(waitingTimeMin) || 0;

    if (currentDistanceKm <= 0 && currentWaitingTimeMin <= 0) {
        return 0;
    }

    baseFare = FLAG_FALL_CHARGE;
    let distanceAfterFlagfallKm = Math.max(0, currentDistanceKm - FLAG_FALL_DISTANCE_KM);

    let distanceIncrements = 0;
    if (distanceAfterFlagfallKm > 0) {
        distanceIncrements = Math.ceil((distanceAfterFlagfallKm * 1000) / INCREMENTAL_DISTANCE_UNIT_M);
    }

    let waitingIncrements = 0;
    if (currentWaitingTimeMin > 0) {
        waitingIncrements = Math.ceil(currentWaitingTimeMin / INCREMENTAL_WAITING_TIME_UNIT_MIN);
    }
    
    for (let i = 0; i < distanceIncrements; i++) {
        if (baseFare < TIER1_FARE_THRESHOLD) {
            baseFare += INCREMENTAL_CHARGE_TIER1;
        } else {
            baseFare += INCREMENTAL_CHARGE_TIER2;
        }
    }

    for (let i = 0; i < waitingIncrements; i++) {
        if (baseFare < TIER1_FARE_THRESHOLD) {
            baseFare += INCREMENTAL_CHARGE_TIER1;
        } else {
            baseFare += INCREMENTAL_CHARGE_TIER2;
        }
    }
    return parseFloat(baseFare.toFixed(1));
};

// --- UI Components ---

// Framed Digital Display Component
const FramedDigitalDisplay = ({ value, mainLabel, unitLabel, size }) => (
    <div className="h-full flex flex-col justify-center items-center relative p-2 bg-black rounded-md">
        <div className="absolute inset-0 border-2 border-white rounded-md z-0"></div>
        
        {/* Use regular font for labels - increased size */}
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-black px-1.5 text-sm md:text-base text-white z-10 font-sans">
            {mainLabel}
        </span>
        
        {/* Only the digital number uses DSEG font */}
        <div 
            className={`text-red-500 leading-none tracking-wider ${size} relative z-5`}
            style={{ 
                fontFamily: "'DSEG7Classic', 'Courier New', monospace",
                fontWeight: 'bold'
            }}
        >
            {Number(value).toFixed(1)}
        </div>

        {/* Use regular font for unit labels - increased size */}
        {unitLabel && (
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black px-1.5 text-base md:text-lg text-white z-10 font-sans">
                {unitLabel}
            </span>
        )}
    </div>
);

// Buttons like in the image
const MeterButton = ({ text, onClick, isActive = false, isWhite = false, className = '', children }) => (
    <button
        onClick={onClick}
        className={`
            px-3 py-2 
            rounded-md text-xs font-semibold transition-colors
            focus:outline-none focus:ring-2 focus:ring-red-500
            ${isWhite 
                ? 'bg-white text-black border border-neutral-400 hover:bg-neutral-100' 
                : isActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-700' 
                    : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300 border border-neutral-600'
            }
            ${className} 
        `}
    >
        {children || text}
    </button>
);

const CircleButton = ({ children, onClick, className = '' }) => (
     <button
        onClick={onClick}
        className={`
            w-8 h-8 md:w-10 md:h-10 flex items-center justify-center
            border-2 border-neutral-500 rounded-full text-neutral-300
            bg-neutral-800 hover:bg-neutral-700 transition-colors
            focus:outline-none focus:ring-2 focus:ring-red-500 text-lg font-bold
            ${className}
        `}
    >
        {children}
    </button>
);

function App() {
    const [mainFare, setMainFare] = useState(0);
    const [extrasFare, setExtrasFare] = useState(0);
    const [isHired, setIsHired] = useState(false);
    const [isRotated, setIsRotated] = useState(false); // Changed from isHorizontal to isRotated
    
    const [elapsedTimeSec, setElapsedTimeSec] = useState(0);
    const [liveDistanceKm, setLiveDistanceKm] = useState(0);
    const [startTime, setStartTime] = useState(null);
    
    // Add GPS-related state
    const [startPosition, setStartPosition] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [gpsError, setGpsError] = useState(null);

    // Calculate distance between two GPS coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in kilometers
    };

    // GPS position success callback
    const handlePositionUpdate = (position) => {
        const newPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
        };
        
        setCurrentPosition(newPosition);
        setGpsError(null);

        // Calculate distance from start position if we have both
        if (startPosition && newPosition) {
            const distance = calculateDistance(
                startPosition.latitude,
                startPosition.longitude,
                newPosition.latitude,
                newPosition.longitude
            );
            setLiveDistanceKm(distance);
        }
    };

    // GPS error callback
    const handlePositionError = (error) => {
        console.error('GPS Error:', error);
        setGpsError(error.message);
        
        // Fallback to simulation if GPS fails
        if (isHired) {
            setLiveDistanceKm(prev => prev + 0.001);
        }
    };

    // Start GPS tracking
    const startGPSTracking = () => {
        if (!navigator.geolocation) {
            setGpsError('Geolocation is not supported by this browser');
            return;
        }

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const initialPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: position.timestamp
                };
                setStartPosition(initialPosition);
                setCurrentPosition(initialPosition);
                setLiveDistanceKm(0);
            },
            handlePositionError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        // Watch position changes
        const id = navigator.geolocation.watchPosition(
            handlePositionUpdate,
            handlePositionError,
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 1000 // Accept cached position up to 1 second old
            }
        );
        
        setWatchId(id);
    };

    // Stop GPS tracking
    const stopGPSTracking = () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
    };

    useEffect(() => {
        if (isHired) {
            const newMainFare = calculateMainFareLogic(liveDistanceKm, elapsedTimeSec / 60);
            setMainFare(newMainFare);
        }
    }, [liveDistanceKm, elapsedTimeSec, isHired]);

    useEffect(() => {
        let interval;
        if (isHired) {
            // Start GPS tracking
            startGPSTracking();
            
            // Timer for elapsed time only
            interval = setInterval(() => {
                setElapsedTimeSec(prev => prev + 1);
            }, 1000);
        } else {
            // Stop GPS tracking
            stopGPSTracking();
            if (interval) clearInterval(interval);
        }
        
        return () => {
            stopGPSTracking();
            if (interval) clearInterval(interval);
        };
    }, [isHired]);

    const toggleHireState = () => {
        if (!isHired) {
            setStartTime(Date.now());
            setElapsedTimeSec(0);
            setLiveDistanceKm(0);
            setMainFare(FLAG_FALL_CHARGE);
            setStartPosition(null);
            setCurrentPosition(null);
            setGpsError(null);
        } else {
            // When stopping, clear GPS tracking
            stopGPSTracking();
        }
        setIsHired(!isHired);
    };

    const addExtras = (amount) => {
        setExtrasFare(prev => prev + amount);
    };

    const resetExtras = () => {
        setExtrasFare(0);
    };

    const resetAll = () => {
        setMainFare(0);
        setExtrasFare(0);
        setIsHired(false);
        setElapsedTimeSec(0);
        setLiveDistanceKm(0);
        setStartTime(null);
        setStartPosition(null);
        setCurrentPosition(null);
        setGpsError(null);
        stopGPSTracking();
    };

    const toggleRotation = () => {
        setIsRotated(!isRotated);
    };

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center p-2 md:p-4 select-none">
            {/* Main container that rotates */}
            <div
                className={`
                    bg-neutral-800 shadow-2xl rounded-lg
                    p-3 md:p-4 border-2 border-neutral-700 flex flex-col font-sans
                    transition-transform duration-500 ease-in-out
                    ${isRotated
                        ? 'rotate-90 h-[90vmin] aspect-[6/10] w-auto' // For landscape: height based on vmin, width derived by aspect ratio
                        : 'rotate-0 w-full max-w-md aspect-[10/6]'   // For portrait: width constrained, height derived by aspect ratio
                    }
                `}
                style={{
                    transformOrigin: 'center center',
                    // Removed the conditional style block for isRotated width/height
                    // Let Tailwind classes manage the sizing.
                }}
            >

                <div className="flex-grow flex items-stretch justify-around bg-black rounded-md p-1 md:p-2 mb-2 md:mb-3 space-x-1 md:space-x-2">
                    <div className="w-3/5">
                        <FramedDigitalDisplay value={mainFare} mainLabel="FARE" unitLabel="HK$" size="text-6xl sm:text-7xl md:text-8xl" />
                    </div>
                    <div className="w-2/5">
                        <FramedDigitalDisplay value={extrasFare} mainLabel="EXTRAS" unitLabel="HK$" size="text-4xl sm:text-5xl md:text-6xl" />
                    </div>
                </div>

                {/* GPS Status indicator */}
                {isHired && gpsError && (
                    <div className="text-center text-xs text-yellow-500 mb-1">
                        GPS: {gpsError} (Using simulation)
                    </div>
                )}
                {isHired && !gpsError && currentPosition && (
                    <div className="text-center text-xs text-green-500 mb-1">
                        GPS: Active • Distance: {liveDistanceKm.toFixed(3)}km
                    </div>
                )}

                {isHired && (
                    <div className="text-center text-sm md:text-base font-bold text-red-600 mb-1 md:mb-2 animate-pulse font-sans">
                        HIRED
                    </div>
                )}
                {!isHired && (
                    <div className="text-center text-sm md:text-base font-bold text-neutral-500 mb-1 md:mb-2 font-sans">
                        FOR HIRE
                    </div>
                )}

                <div className="flex items-end">
                    <div className="flex space-x-1 md:space-x-2">
                        <MeterButton
                            text={isHired ? "停" : "空"}
                            onClick={toggleHireState}
                            className={`w-12 md:w-16 !text-base md:!text-lg font-bold ${
                                isHired
                                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-700' 
                                    : 'bg-red-500 hover:bg-red-600 text-white border-red-600' 
                            }`}
                        />
                        <MeterButton text="空" onClick={() => {}} className="w-10 md:w-12 opacity-50 cursor-not-allowed" isActive={false} />
                        <MeterButton text="暫停" onClick={() => {}} className="w-10 md:w-12 opacity-50 cursor-not-allowed" isActive={false} />
                        <MeterButton text="附加" onClick={() => {}} className="w-10 md:w-12 opacity-50 cursor-not-allowed" isActive={false} />
                    </div>

                    <div className="flex-grow"></div>

                    <div className="flex flex-col items-center space-y-1 md:space-y-2">
                        <MeterButton text="+ $10" onClick={() => addExtras(10)} className="w-12 md:w-16 h-7 md:h-8 !text-xs" isWhite={true}/>
                        <MeterButton text="+ $1" onClick={() => addExtras(1)} className="w-12 md:w-16 h-7 md:h-8 !text-xs" isWhite={true}/>
                        <div className="flex space-x-1 md:space-x-2 pt-1">
                           <CircleButton onClick={resetExtras}>$</CircleButton>
                           <CircleButton onClick={resetAll}>i</CircleButton>
                           <CircleButton onClick={toggleRotation} className="transform transition-transform duration-300">
                               <span className={`inline-block transform transition-transform duration-300 ${isRotated ? 'rotate-90' : ''}`}>
                                   ⟲
                               </span>
                           </CircleButton>
                        </div>
                    </div>
                </div>
                <div className="text-center text-xs text-neutral-600 mt-2 absolute bottom-1 left-1/2 -translate-x-1/2 font-sans">
                    Urban Taxi Fares (July 2024)
                </div>
            </div>
        </div>
    );
}

export default App;

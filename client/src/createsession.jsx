export const createSession = async (startLocation, destinationLocation, departureTime, mealTime) => {
    // Type checking for location_info
    if (
        typeof startLocation !== 'object' || 
        typeof destinationLocation !== 'object' ||
        typeof startLocation.latitude !== 'number' || 
        typeof startLocation.longitude !== 'number' ||
        typeof destinationLocation.latitude !== 'number' || 
        typeof destinationLocation.longitude !== 'number'
    ) {
        throw new Error('Start location and destination location must be objects with latitude and longitude as numbers.');
    }

    // Type checking for departureTime and mealTime
    if (!(departureTime instanceof Date) || !(mealTime instanceof Date)) {
        throw new Error('Departure time and meal time must be valid Date objects.');
    }

    // Ensure that departureTime is before mealTime
    if (departureTime >= mealTime) {
        throw new Error('Departure time must be before meal time.');
    }

    const sessionData = {
        startLocation,
        destinationLocation,
        departureTime,
        mealTime,
    };

    try {
        const response = await fetch('http://localhost:5111/api/sessions', { // Adjust port as necessary
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const session = await response.json();
        console.log('Session created:', session);
        return session;
    } catch (error) {
        console.error('Error creating session:', error);
    }
};

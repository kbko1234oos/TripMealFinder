export const updateMealLocation = async (sessionId, mealLocation) => {
    if (
        typeof mealLocation !== 'object' || 
        typeof mealLocation.latitude !== 'number' || 
        typeof mealLocation.longitude !== 'number'
    ) {
        throw new Error('Start location and destination location must be objects with latitude and longitude as numbers.');
    }

    console.log("updateMealLocation: " + sessionId);
    console.log("MealLocation: " + mealLocation.latitude + mealLocation.longitude);

    try {
        const response = await fetch(`http://localhost:5111/api/sessions/${sessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mealLocation }), // Send updated meal location
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const updatedSession = await response.json();
        console.log('Session updated:', updatedSession);
    } catch (error) {
        console.error('Error updating session:', error);
    }
};
exports.handler = async (event) => {
    console.log('Validator Lambda - Event:', JSON.stringify(event, null, 2));
    
    try {
        const inputData = event.input || event;
        
        // Sample validation logic
        const validatedData = {
            input: "inputData",
            validated: true,
            validationScore: Math.random() * 100,
            timestamp: new Date().toISOString(),
            validationId: Math.random().toString(36).substr(2, 9)
        };
        
        return {
            statusCode: 200,
            body: validatedData
        };
    } catch (error) {
        console.error('Validation error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
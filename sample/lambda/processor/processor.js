exports.handler = async (event) => {
    console.log('Processor Lambda - Event:', JSON.stringify(event, null, 2));
    
    try {
        const inputData = event.input || event;
        
        // Sample processing logic
        const processedData = {
            original: "inputData",
            processed: true,
            timestamp: new Date().toISOString(),
            processingId: Math.random().toString(36).substr(2, 9)
        };
        
        return {
            statusCode: 200,
            body: processedData
        };
    } catch (error) {
        console.error('Processing error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
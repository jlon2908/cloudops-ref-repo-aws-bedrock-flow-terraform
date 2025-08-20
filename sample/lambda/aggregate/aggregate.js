module.exports.aggregate = async (event) => {
  try {
    console.log('📥 Input Event:', JSON.stringify(event));

    const inputs = event?.node?.inputs || [];

    const rawArch = inputs.find(i => i.name === 'architectureValidation')?.value;
    const sonarText = inputs.find(i => i.name === 'dddValidation')?.value;
    const coverageText = inputs.find(i => i.name === 'coverageValidation')?.value;
    const reviewHU = inputs.find(i => i.name === 'huValidation')?.value;
    const webhookUrl = inputs.find(i => i.name === 'webhookUrl')?.value;

    if (!rawArch || !sonarText || !coverageText || !reviewHU) {
      return {
        messageVersion: "1.0",
        response: {
          error: "❌ Missing one or more required inputs."
        }
      };
    }

    // Intenta parsear el JSON embebido
    let architecturePercentage = rawArch;
    try {
      const archJson = JSON.parse(rawArch);
      architecturePercentage = archJson ?? 'N/A';
    } catch (err) {
      console.warn("⚠️ Could not parse clean architecture input:", err.message);
    }

    // Intenta parsear el JSON embebido
    let reviewHUJson = reviewHU;
    try {
      const reviewJson = JSON.parse(reviewHU);
      reviewHUJson = reviewJson ?? 'N/A';
    } catch (err) {
      console.warn("⚠️ Could not parse reviewHU input:", err.message);
    }


    const summary = `
🧱 *Clean Architecture Compliance*: ${architecturePercentage}%

🧪 *SonarCloud Analysis*:
${sonarText.substring(0, 1000)}...

🧪 *reviewHU Analysis*:
${reviewHUJson}...

📊 *Coverage Suggestions*:
${coverageText.substring(0, 1000)}...
    `.trim();

    

    // 🔁 Función para enviar el resumen al webhook
    const sendWebhookSummary = async (url, summaryText) => {
      try {
        console.log(`🌐 Sending summary to webhook: ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Aggregate-Function/1.0'
          },
          body: JSON.stringify({ summary: summaryText }),
          timeout: 10000
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('✅ Webhook response received');
      } catch (error) {
        console.error('❌ Error sending summary to webhook:', error.message);
        return null;
      }
    };

    if (webhookUrl) {
      await sendWebhookSummary(webhookUrl, summary);
    }

    return {
      response: {
        summary
      }
    };
  } catch (error) {
    console.error("❌ Aggregation error:", error);
    return {
      messageVersion: "1.0",
      response: {
        error: "❌ Internal Server Error during aggregation."
      }
    };
  }
};

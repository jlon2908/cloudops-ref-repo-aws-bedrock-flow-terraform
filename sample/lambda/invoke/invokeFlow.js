const {
    BedrockAgentRuntimeClient,
    StartFlowExecutionCommand,
  } = require("@aws-sdk/client-bedrock-agent-runtime");
  
  const crypto = require("crypto");
  
  const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });
  
  module.exports.invokeFlow = async (event) => {
  try {
    console.log("event-> ", event);
    const body = event.body ? JSON.parse(event.body) : {};
    const { repoUrl, branch = "develop", webhookUrl } = body;

    if (!repoUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing repoUrl in request body" }),
      };
    }

    const sessionId = crypto.randomUUID();
    let inputsSend = { repoUrl };
    if (webhookUrl) {
      inputsSend.webhookUrl = webhookUrl;
    }
    console.log("inputsSend-> ", inputsSend);
    const inputs = [
      {
          content: {
            "document": inputsSend
          },
          nodeName: "FlowInputNode",
          nodeOutputName: "document"
        }
    ];

    

    console.log("🧪 Inputs finales:", JSON.stringify(inputs, null, 2));

    const command = new StartFlowExecutionCommand({
      flowIdentifier: process.env.FLOW_ID,
      flowAliasIdentifier: process.env.FLOW_ALIAS_ID,
      sessionId,
      inputs,
    });

    const response = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Flow started",
        sessionId,
        response,
        webhookConfigured: !!webhookUrl,
        webhookUrl: webhookUrl || null
      }),
    };
  } catch (error) {
    console.error("❌ Error invoking Bedrock Agent Flow:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
  
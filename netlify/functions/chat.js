
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { message, language, conversation } =
      JSON.parse(event.body || "{}");

    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required" })
      };
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    const secret = process.env.MAKE_WEBHOOK_SECRET;

    if (!webhookUrl || !secret) {
      throw new Error("Server configuration missing");
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-novera-secret": secret
      },
      body: JSON.stringify({
        message,
        language: language || "nl",
        conversation: conversation || []
      })
    });

    if (!response.ok) {
      throw new Error("Make webhook failed");
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reply: data.reply
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Novera is tijdelijk niet beschikbaar"
      })
    };
  }
};

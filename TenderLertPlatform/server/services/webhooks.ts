export async function sendToN8nRegisterWebhook(data: {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  categoryInterested: string;
}): Promise<boolean> {
  const webhookUrl = process.env.N8N_REGISTER_WEBHOOK;
  
  if (!webhookUrl) {
    console.warn("N8N_REGISTER_WEBHOOK not configured, skipping webhook");
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "client_registration",
        timestamp: new Date().toISOString(),
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    console.log("Successfully sent to n8n register webhook");
    return true;
  } catch (error) {
    console.error("Failed to send to n8n register webhook:", error);
    return false;
  }
}

export async function sendToN8nContactWebhook(data: {
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  const webhookUrl = process.env.N8N_CONTACT_WEBHOOK;
  
  if (!webhookUrl) {
    console.warn("N8N_CONTACT_WEBHOOK not configured, skipping webhook");
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "contact_submission",
        timestamp: new Date().toISOString(),
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    console.log("Successfully sent to n8n contact webhook");
    return true;
  } catch (error) {
    console.error("Failed to send to n8n contact webhook:", error);
    return false;
  }
}

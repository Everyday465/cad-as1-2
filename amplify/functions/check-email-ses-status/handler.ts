import { SESv2Client, GetEmailIdentityCommand } from "@aws-sdk/client-sesv2";

let client: SESv2Client;
export const handler = async (event: any) => {
    const { userEmail } = event.arguments;
    if (!client) client = new SESv2Client({});

    const command = new GetEmailIdentityCommand({ EmailIdentity: userEmail });

    try {
      const response = await client.send(command);
      return response.VerificationStatus; // "Pending", "Success", or "Failed"
    } catch (error) {
      console.error("Error checking email verification:", error);
    }
    
};
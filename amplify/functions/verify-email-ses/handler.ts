import { SESv2Client, CreateEmailIdentityCommand } from "@aws-sdk/client-sesv2";

let client: SESv2Client;
export const handler = async (event: any) => {
    const { userEmail } = event.arguments;
    if (!client) client = new SESv2Client({});

    const command = new CreateEmailIdentityCommand({ EmailIdentity: userEmail });

    try {
        await client.send(command);
        return {
          statusCode: 200,
          body: JSON.stringify({ message: "Verification email sent." }),
        };
      } catch (error) {
        console.error("SES Verification Error:", error);
        return {
          statusCode: 500,
          body: JSON.stringify({ message: "Failed to send verification email." }),
        };
      }
    
};
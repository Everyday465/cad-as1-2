
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { EmailWrapper } from "../utils/email-wrapper";
import { Email } from "../utils/notification-email";

let client: SESv2Client;
export const handler = async (event: any) => {
    const { itemId, itemName, itemDesc, username, userEmail, createdAt } = event.arguments;
    if (!client) client = new SESv2Client({});
    

    const input: SendEmailCommandInput = {
    FromEmailAddress: 'agnoteelijah@gmail.com',
    Destination: {ToAddresses: [userEmail] },
    EmailTags: [{ Name: 'type', Value: 'appointment-confirmation'}],
    ReplyToAddresses: ['agnoteelijah@gmail.com'],
    Content: {
        Simple: {
        Subject: {Data: 'New item found in Lost&Found!' },
        Body: {
            Html: {
                Charset: 'UTF-8',
                Data: EmailWrapper(
                    Email(
                        {
                            id:itemId,
                            username: username,
                            itemName:itemName,
                            itemDesc:itemDesc,
                            userEmail:userEmail,
                            createdAt:createdAt
                        
                    }
                )
            ),
        },
        Text: { Data: 'Test email' },
    },
    },
    },
    };
const command = new SendEmailCommand(input);
await client.send(command);
// try {
//     await client.send(command);
//     return {
//         statusCode: 200,
//         headers: {
//             "Access-Control-Allow-Origin": "*",
//             "Access-Control-Allow-Methods": "OPTIONS,POST",
//             "Access-Control-Allow-Headers": "Content-Type",
//         },
//         body: JSON.stringify({ message: "Email sent successfully!" }),
//     };
// } catch (error) {
//     console.error("Error sending email:", error);
//     return {
//         statusCode: 500,
//         headers: {
//             "Access-Control-Allow-Origin": "*",
//             "Access-Control-Allow-Methods": "OPTIONS,POST",
//             "Access-Control-Allow-Headers": "Content-Type",
//         },
//         body: JSON.stringify({ error: "Failed to send email" }),
//     };
// }
};
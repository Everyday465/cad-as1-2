import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" }); // Change to your AWS region

interface PostConfirmationEvent {
  userPoolId: string;
  userName: string;
}

export const handler = async (event: PostConfirmationEvent): Promise<PostConfirmationEvent> => {
  const userPoolId = event.userPoolId;
  const username = event.userName;
  const groupName = "STUDENTS"; // Default group

  const params = {
    GroupName: groupName,
    UserPoolId: userPoolId,
    Username: username,
  };

  try {
    const command = new AdminAddUserToGroupCommand(params);
    await cognitoClient.send(command);
    console.log(`✅ User ${username} successfully added to group ${groupName}`);
  } catch (error) {
    console.error("❌ Error adding user to group:", error);
  }

  return event; // Required by AWS Lambda triggers
};

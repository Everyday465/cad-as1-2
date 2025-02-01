import { defineAuth } from '@aws-amplify/backend';
import { addUserToGroup } from "../data/add-user-to-group/resource"

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },

  groups: ["ADMINS", "STUDENTS"],

  userAttributes: {
    "custom:username": {
      dataType: "String",
      mutable: true,
      maxLen: 16,
      minLen: 1,
    },
    "custom:profile_pic": {
      dataType: "String",
      mutable: true,
    },
    "custom:auth_type": {
      dataType: "String",
      mutable: true,
    },
    "custom:is_subscribed": {
      dataType: "String",
      mutable: true,
    },
  },
    
  access: (allow) => [
    allow.resource(addUserToGroup).to(["addUserToGroup"])
  ],
});

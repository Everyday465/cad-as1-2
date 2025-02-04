import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { notification } from "../functions/notification/resource";
import { verifyEmailSES } from "../functions/verify-email-ses/resource";
import { checkEmailSESStatus } from "../functions/check-email-ses-status/resource";

/*== STEP 1 ===============================================================
The section below creates two database tables: "Todo" and "Notes". 
=========================================================================*/
const schema = a.schema({

  Item: a
  .model({
    itemName: a.string(),
    itemDesc: a.string(),
    itemType: a.string(),
    itemStatus: a.string(),
    foundLostBy: a.string(),
    imagePath: a.string(),
    labels: a.string(),
  })
  .authorization((allow) => [
    allow.groups(["ADMINS"]).to(["read", "create", "update", "delete"]),
    allow.groups(["STUDENTS"]).to(["read"]),
  ]),


  UserProfile: a
    .model({
      userId: a.string().required(),
      email: a.string(),
      username: a.string(),
      authType: a.string(),
      profilePath: a.string(),
      isSubscribed: a.string(),
    })
    .identifier(["userId"])
    .authorization((allow) => [
      allow.groups(["ADMINS"]).to(["read", "create", "update", "delete"]),
      allow.groups(["STUDENTS"]).to(["read", "create", "update"])
    ]),

  sendNotification: a
    .query()
    .arguments({
      itemId: a.string(),
      itemName: a.string(),
      itemDesc: a.string(),
      username: a.string(),
      userEmail: a.string(),
      createdAt: a.string(),
    })
    .authorization((allow) => [
      allow.groups(["ADMINS"]),
      allow.groups(["STUDENTS"]),
    ])
    .handler(a.handler.function(notification))
    .returns(
      a.json()
    ),

    verifyEmailSES: a
    .query()
    .arguments({
      userEmail: a.string(),
    })
    .authorization((allow) => [
      allow.groups(["ADMINS"]),
      allow.groups(["STUDENTS"]),
    ])
    .handler(a.handler.function(verifyEmailSES))
    .returns(
      a.json()
    ),

    checkEmailSESStatus: a
    .query()
    .arguments({
      userEmail: a.string(),
    })
    .authorization((allow) => [
      allow.groups(["ADMINS"]),
      allow.groups(["STUDENTS"]),
    ])
    .handler(a.handler.function(checkEmailSESStatus))
    .returns(
      a.json()
    ),

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Generate and use Data clients for your frontend code.
Refer to Amplify's documentation for detailed frontend setup.
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the respective database tables in your frontend component.
=========================================================================*/

// Example fetching from Notes table
// const { data: notes } = await client.models.Notes.list()

// return <ul>{notes.map(note => <li key={note.id}>{note.title}: {note.content}</li>)}</ul>

import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { addUserToGroup } from "./add-user-to-group/resource"

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
    })
    .authorization((allow) => [
      allow.groups(["ADMINS"]).to(["read", "create", "update", "delete"]),
      allow.groups(["STUDENTS"]).to(["read"])
    ]),

  addUserToGroup: a
    .mutation()
    .arguments({
      userId: a.string().required(),
      groupName: a.string().required(),
    })
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(addUserToGroup))
    .returns(a.json()),

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

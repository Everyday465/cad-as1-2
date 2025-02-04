import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

import * as iam from 'aws-cdk-lib/aws-iam';

import { storage } from './storage/resource';
import { notification } from './functions/notification/resource';
import { verifyEmailSES } from './functions/verify-email-ses/resource';
import { checkEmailSESStatus } from './functions/check-email-ses-status/resource';
import { postConfirmation } from './functions/postConfirmation/resource'; // Import PostConfirmation function

const backend = defineBackend({
  auth,
  data,
  storage,
  notification,
  verifyEmailSES,
  checkEmailSESStatus,
  postConfirmation, // Add PostConfirmation function
});

// ✅ Attach SES Access Policy
(() => {
  const checkEmailSESStatusLambda = backend.checkEmailSESStatus.resources.lambda;
  const verifyEmailSESLambda = backend.verifyEmailSES.resources.lambda;
  const notificationLambda = backend.notification.resources.lambda;

  const sesPolicyStatement = new iam.PolicyStatement({
    sid: 'AllowSES',
    actions: ['ses:*'],
    resources: ['arn:aws:ses:us-east-1:058264429730:identity/*'],
  });

  checkEmailSESStatusLambda.addToRolePolicy(sesPolicyStatement);
  verifyEmailSESLambda.addToRolePolicy(sesPolicyStatement);
  notificationLambda.addToRolePolicy(sesPolicyStatement);
})();

// ✅ Attach Cognito Group Management Policy to PostConfirmation Lambda
(() => {
  const postConfirmationLambda = backend.postConfirmation.resources.lambda;

  const cognitoPolicyStatement = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ["cognito-idp:AdminAddUserToGroup"],
    resources: ["arn:aws:cognito-idp:us-east-1:058264429730:userpool/us-east-1_erFvO2LdX"], // Replace with actual values
  });

  postConfirmationLambda.addToRolePolicy(cognitoPolicyStatement);
})();

// ✅ Amplify Predictions Permissions
(() => {
  backend.auth.resources.groups["ADMINS"].role.addToPrincipalPolicy(
    new iam.PolicyStatement({
      actions: ["rekognition:DetectLabels"],
      resources: ["*"],
    })
  );

  backend.auth.resources.groups["STUDENTS"].role.addToPrincipalPolicy(
    new iam.PolicyStatement({
      actions: ["rekognition:DetectLabels"],
      resources: ["*"],
    })
  );

  backend.addOutput({
    custom: {
      Predictions: {
        identify: {
          identifyLabels: {
            defaults: {
              type: "ALL",
            },
            proxy: false,
            region: backend.auth.stack.region,
          },
        },
      },
    },
  });
})();

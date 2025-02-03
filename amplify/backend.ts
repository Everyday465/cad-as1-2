import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

import * as iam from 'aws-cdk-lib/aws-iam';

import { storage } from './storage/resource';
import { notification } from './functions/notification/resource';
import { verifyEmailSES } from './functions/verify-email-ses/resource';
import { checkEmailSESStatus } from './functions/check-email-ses-status/resource';


const backend = defineBackend({
  auth,
  data,
  storage,
  notification,
  verifyEmailSES,
  checkEmailSESStatus,
});

//ses access
(() => {
  // Access the Lambda function resources
  const checkEmailSESStatusLambda = backend.checkEmailSESStatus.resources.lambda;
  const verifyEmailSESLambda = backend.verifyEmailSES.resources.lambda;
  const notificationLambda = backend.notification.resources.lambda;

  // Define a new IAM Policy Statement for SES SendEmail
  const sesPolicyStatement = new iam.PolicyStatement({
    sid: 'AllowSES',
    actions: ['ses:*'],
    resources: ['arn:aws:ses:us-east-1:058264429730:identity/*'],
  });

  // Attach the SES policy to the Lambda functions
  checkEmailSESStatusLambda.addToRolePolicy(sesPolicyStatement);
  verifyEmailSESLambda.addToRolePolicy(sesPolicyStatement);
  notificationLambda.addToRolePolicy(sesPolicyStatement);
})();

//amplify prediction
(() => {
  // Grant permission to use AWS Rekognition for label detection
backend.auth.resources.groups["ADMINS"].role.addToPrincipalPolicy(
  new iam.PolicyStatement({
    actions: [
      "rekognition:DetectLabels",
    ],
    resources: ["*"],
  })
);

// Configure Predictions category for label detection
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
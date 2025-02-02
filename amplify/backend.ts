import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { notification } from './functions/notification/resource';
import { verifyEmailSES } from './functions/verify-email-ses/resource';
import { checkEmailSESStatus } from './functions/check-email-ses-status/resource';


defineBackend({
  auth,
  data,
  storage,
  notification,
  verifyEmailSES,
  checkEmailSESStatus,
});



import { defineFunction } from '@aws-amplify/backend';

export const checkEmailSESStatus = defineFunction({
    // optionally specify a name for the Function (defaults to directory name)
    name: 'check-email-ses-status',
    // optionally specify a path to your handler (defaults to "./handler.ts")
    entry: './handler.ts',
});
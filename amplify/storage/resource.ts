import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'sesame-street-images',
  access: (allow) => ({
    'dev/*': [
      allow.authenticated.to(['read','write']),
      allow.guest.to(['read'])
    ],
  })
});
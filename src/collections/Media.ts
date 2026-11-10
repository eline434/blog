import type { CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Settings',
  },
  access: {
    read: anyone,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  upload: {
    // Videos are stored in Vercel Blob just like images; only the reference lives in Postgres.
    // Payload sniffs the real type from the file contents: many .mp4 files are detected as
    // video/x-m4v or video/3gpp, so listing only video/mp4 rejects them.
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe what the image or video shows, for screen readers.' },
    },
  ],
}

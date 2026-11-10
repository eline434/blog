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
    mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'video/quicktime'],
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

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
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe what the image shows, for screen readers.' },
    },
  ],
}

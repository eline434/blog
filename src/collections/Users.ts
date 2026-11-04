import type { CollectionConfig } from 'payload'

import { loggedIn } from '../access'

/** Admin logins only. The public team page reads from TeamMembers, so emails never leave the admin. */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
  },
  auth: true,
  access: {
    read: loggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [],
}

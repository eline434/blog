import type { CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'topics'],
    group: 'Log',
    description: 'Who does what. Shown on the public team page.',
  },
  defaultSort: 'order',
  access: {
    read: anyone,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: { description: 'For example: UX lead, front-end developer.' },
    },
    {
      name: 'topics',
      label: 'Main topics',
      type: 'relationship',
      relationTo: 'topics',
      hasMany: true,
    },
    {
      name: 'responsibilities',
      type: 'array',
      labels: { singular: 'Responsibility', plural: 'Responsibilities' },
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers come first.' },
    },
  ],
}

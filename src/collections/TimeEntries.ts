import type { CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access'

export const TimeEntries: CollectionConfig = {
  slug: 'time-entries',
  labels: { singular: 'Time entry', plural: 'Hours' },
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['date', 'member', 'hours', 'topic', 'description'],
    group: 'Log',
    description: 'One line per person, per day, per topic.',
  },
  defaultSort: '-date',
  access: {
    read: anyone,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          index: true,
          defaultValue: () => new Date().toISOString(),
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
        },
        {
          name: 'hours',
          type: 'number',
          required: true,
          min: 0.25,
          max: 24,
          admin: { step: 0.25, description: 'In steps of 0.25.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'member',
          type: 'relationship',
          relationTo: 'team-members',
          required: true,
        },
        {
          // One topic per line, so the totals per topic add up to the real total.
          name: 'topic',
          type: 'relationship',
          relationTo: 'topics',
          required: true,
        },
      ],
    },
    {
      name: 'description',
      label: 'What did you do?',
      type: 'text',
      required: true,
    },
  ],
}

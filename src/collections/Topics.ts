import { slugField, type CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access'

export const TOPIC_COLORS = [
  { label: 'Blue', value: 'blue' },
  { label: 'Orange', value: 'orange' },
  { label: 'Aqua', value: 'aqua' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Magenta', value: 'magenta' },
  { label: 'Green', value: 'green' },
  { label: 'Violet', value: 'violet' },
  { label: 'Red', value: 'red' },
]

export const Topics: CollectionConfig = {
  slug: 'topics',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'color', 'order'],
    group: 'Settings',
    description: 'The filters on the site. Add a topic here and it shows up everywhere.',
  },
  defaultSort: 'order',
  access: {
    read: anyone,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField({ useAsSlug: 'title' }),
    {
      name: 'color',
      type: 'select',
      required: true,
      defaultValue: 'blue',
      options: TOPIC_COLORS,
      admin: { description: 'Pick a colour no other topic uses, so charts stay readable.' },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 10,
      admin: { description: 'Lower numbers come first in the filter.' },
    },
  ],
}

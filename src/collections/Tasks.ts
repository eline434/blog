import type { CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access'

export const TASK_STATUSES = [
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'doing' },
  { label: 'Done', value: 'done' },
  { label: 'Blocked', value: 'blocked' },
]

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  labels: { singular: 'Planning item', plural: 'Planning' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'topic', 'owner', 'startDate', 'endDate', 'status'],
    group: 'Log',
    description: 'Tasks and milestones. These build the timeline on the planning page.',
  },
  defaultSort: 'startDate',
  access: {
    read: anyone,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'topic', type: 'relationship', relationTo: 'topics', required: true },
        { name: 'owner', type: 'relationship', relationTo: 'team-members' },
      ],
    },
    {
      name: 'isMilestone',
      label: 'This is a milestone (a single date, such as a deadline)',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          label: 'Start (or milestone date)',
          type: 'date',
          required: true,
          index: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
        },
        {
          name: 'endDate',
          label: 'End',
          type: 'date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
            condition: (data) => !data?.isMilestone,
          },
          validate: (value: Date | string | null | undefined, { data }: { data: unknown }) => {
            const { isMilestone, startDate } = (data ?? {}) as {
              isMilestone?: boolean
              startDate?: string
            }
            if (isMilestone) return true
            if (!value) return 'Add an end date.'
            if (startDate && new Date(value) < new Date(startDate)) {
              return 'The end date cannot be before the start date.'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'todo',
      options: TASK_STATUSES,
    },
    { name: 'notes', type: 'textarea' },
  ],
}

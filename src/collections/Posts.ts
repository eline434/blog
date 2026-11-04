import type { CollectionConfig } from 'payload'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { slugField } from '../fields/slug'

export const POST_TYPES = [
  { label: 'Research', value: 'research' },
  { label: 'Process', value: 'process' },
  { label: 'Feedback report', value: 'feedback' },
  { label: 'AI use', value: 'ai' },
]

export const FEEDBACK_SOURCES = [
  { label: 'Client', value: 'client' },
  { label: 'Expert', value: 'expert' },
  { label: 'Coach', value: 'coach' },
  { label: 'User test', value: 'user-test' },
]

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Log entry', plural: 'Log entries' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'topics', 'publishedDate', '_status'],
    group: 'Log',
    description: 'Research, process updates, feedback reports and AI use all live here.',
  },
  defaultSort: '-publishedDate',
  access: {
    read: publishedOrLoggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
    readVersions: loggedIn,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'process',
          index: true,
          options: POST_TYPES,
          admin: { description: 'Feedback reports and AI use get extra fields below.' },
        },
        {
          name: 'topics',
          type: 'relationship',
          relationTo: 'topics',
          hasMany: true,
          required: true,
          admin: { description: 'This is what the filter on the site uses.' },
        },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: { description: 'One or two sentences, shown in the list.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            { name: 'body', type: 'richText' },
            {
              name: 'gallery',
              label: 'Visual documentation',
              type: 'array',
              labels: { singular: 'Image', plural: 'Images' },
              admin: { description: 'Sketches, wireframes, screenshots, photos.' },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text' },
              ],
            },
            {
              name: 'sources',
              type: 'array',
              labels: { singular: 'Source', plural: 'Sources' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'url', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Feedback report',
          admin: {
            condition: (data) => data?.type === 'feedback',
          },
          fields: [
            {
              name: 'feedback',
              type: 'group',
              label: false,
              admin: { condition: (data) => data?.type === 'feedback' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'source',
                      label: 'Feedback from',
                      type: 'select',
                      required: true,
                      options: FEEDBACK_SOURCES,
                    },
                    { name: 'people', label: 'Who was there?', type: 'text' },
                  ],
                },
                {
                  name: 'actions',
                  label: 'What are we doing with it?',
                  type: 'array',
                  labels: { singular: 'Action', plural: 'Actions' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'action', type: 'text', required: true },
                        { name: 'owner', type: 'relationship', relationTo: 'team-members' },
                        { name: 'done', type: 'checkbox', defaultValue: false },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'AI use',
          admin: {
            condition: (data) => data?.type === 'ai',
          },
          description: 'Be critical and transparent: the mistakes are as useful as the wins.',
          fields: [
            {
              name: 'ai',
              type: 'group',
              label: false,
              admin: { condition: (data) => data?.type === 'ai' },
              fields: [
                { name: 'tools', label: 'Tool(s) used', type: 'text', required: true },
                { name: 'asked', label: 'What did you ask it?', type: 'textarea', required: true },
                {
                  name: 'kept',
                  label: 'What did you keep?',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'rejected',
                  label: 'What was wrong, or what did you reject?',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'verified',
                  label: 'How did you check the result?',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'publishedDate',
      label: 'Date',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'team-members',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    slugField('sidebar'),
  ],
}

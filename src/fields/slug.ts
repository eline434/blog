import type { TextField } from 'payload'

const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** The URL part of a page. Left empty, it is generated from the title when saving. */
export const slugField = (position?: 'sidebar'): TextField => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  // The hook below fills the value, so the form must accept an empty field.
  validate: () => true,
  admin: {
    position,
    description: 'Leave empty to generate it from the title.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const source = typeof value === 'string' && value ? value : data?.title
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})

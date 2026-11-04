import type { GlobalConfig } from 'payload'

import { anyone, loggedIn } from '../access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Project info',
  admin: { group: 'Settings' },
  access: {
    read: anyone,
    update: loggedIn,
  },
  fields: [
    {
      name: 'projectName',
      type: 'text',
      required: true,
      defaultValue: "Bachelor's thesis log",
    },
    {
      name: 'intro',
      type: 'textarea',
      admin: { description: 'A sentence or two about the project, shown at the top of the log.' },
    },
    { name: 'client', type: 'text' },
    { name: 'coach', type: 'text' },
  ],
}

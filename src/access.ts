import type { Access } from 'payload'

/** The log is public so a coach can read it at any time without an account. */
export const anyone: Access = () => true

export const loggedIn: Access = ({ req: { user } }) => Boolean(user)

/** Visitors only see published entries, the team also sees its drafts. */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

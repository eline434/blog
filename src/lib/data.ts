import config from '@payload-config'
import { getPayload, type Where } from 'payload'

import type { Media, Post, Task, TeamMember, TimeEntry, Topic } from '@/payload-types'

const client = () => getPayload({ config })

// overrideAccess: false applies the public access rules, so visitors never receive drafts.
const publicQuery = { overrideAccess: false, pagination: false } as const

export const getSettings = async () =>
  (await client()).findGlobal({ slug: 'settings', overrideAccess: false })

export const getTopics = async (): Promise<Topic[]> =>
  (await (await client()).find({ collection: 'topics', ...publicQuery, sort: 'order' })).docs

export const getPosts = async (search?: string): Promise<Post[]> => {
  const where: Where | undefined = search
    ? { or: [{ title: { like: search } }, { excerpt: { like: search } }] }
    : undefined
  const result = await (
    await client()
  ).find({ collection: 'posts', ...publicQuery, depth: 1, sort: '-publishedDate', where })
  return result.docs
}

export const getPost = async (slug: string): Promise<Post | null> => {
  const result = await (
    await client()
  ).find({
    collection: 'posts',
    overrideAccess: false,
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] ?? null
}

export const getTimeEntries = async (): Promise<TimeEntry[]> =>
  (await (await client()).find({ collection: 'time-entries', ...publicQuery, depth: 1, sort: '-date' }))
    .docs

export const getTasks = async (): Promise<Task[]> =>
  (await (await client()).find({ collection: 'tasks', ...publicQuery, depth: 1, sort: 'startDate' })).docs

export const getTeam = async (): Promise<TeamMember[]> =>
  (await (await client()).find({ collection: 'team-members', ...publicQuery, depth: 1, sort: 'order' }))
    .docs

/** A relationship is an id or a populated document, depending on depth. */
export const populated = <T extends object>(value: number | T | null | undefined): T | null =>
  value && typeof value === 'object' ? value : null

export const populatedList = <T extends object>(values: (number | T)[] | null | undefined): T[] =>
  (values ?? []).filter((value): value is T & object => typeof value === 'object')

export const media = (value: number | Media | null | undefined): (Media & { url: string }) | null => {
  const doc = populated(value)
  return doc?.url ? (doc as Media & { url: string }) : null
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>

export const param = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value || undefined

/** Build a link that changes some filters and keeps the others. */
export const filterHref = (
  path: string,
  current: Record<string, string | undefined>,
  changes: Record<string, string | undefined>,
): string => {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    if (value) query.set(key, value)
  }
  const text = query.toString()
  return text ? `${path}?${text}` : path
}

import Image from 'next/image'
import Link from 'next/link'

import { POST_TYPES } from '@/collections/Posts'
import { Chips } from '@/components/Chips'
import { Empty } from '@/components/Empty'
import {
  filterHref,
  getPosts,
  getSettings,
  getTopics,
  media,
  param,
  populatedList,
  type SearchParams,
} from '@/lib/data'
import { dayKey, formatDay } from '@/lib/dates'
import type { Post, Topic } from '@/payload-types'

const typeLabel = (value: string) => POST_TYPES.find((type) => type.value === value)?.label ?? value

const hasTopic = (post: Post, slug: string) =>
  populatedList<Topic>(post.topics).some((topic) => topic.slug === slug)

export default async function LogPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams
  const current = { topic: param(raw.topic), type: param(raw.type), q: param(raw.q) }
  const [settings, topics, posts] = await Promise.all([
    getSettings(),
    getTopics(),
    getPosts(current.q),
  ])

  // Each count respects the other filter, so a chip never promises entries that are not there.
  const ofType = current.type ? posts.filter((post) => post.type === current.type) : posts
  const ofTopic = current.topic ? posts.filter((post) => hasTopic(post, current.topic!)) : posts
  const visible = current.topic
    ? ofType.filter((post) => hasTopic(post, current.topic!))
    : ofType

  return (
    <>
      {settings.intro && <p className="intro">{settings.intro}</p>}

      <section className="filters" aria-label="Filters">
        <Chips
          large
          label="Topic"
          chips={[
            {
              label: 'All',
              href: filterHref('/', current, { topic: undefined }),
              active: !current.topic,
              count: ofType.length,
            },
            ...topics.map((topic) => ({
              label: topic.title,
              href: filterHref('/', current, { topic: topic.slug }),
              active: current.topic === topic.slug,
              color: topic.color,
              count: ofType.filter((post) => hasTopic(post, topic.slug)).length,
            })),
          ]}
        />
        <div className="filters__row">
          <Chips
            label="Type"
            chips={[
              {
                label: 'All',
                href: filterHref('/', current, { type: undefined }),
                active: !current.type,
                count: ofTopic.length,
              },
              ...POST_TYPES.map((type) => ({
                label: type.label,
                href: filterHref('/', current, { type: type.value }),
                active: current.type === type.value,
                count: ofTopic.filter((post) => post.type === type.value).length,
              })),
            ]}
          />
          <form className="search" role="search" action="/">
            {current.topic && <input type="hidden" name="topic" value={current.topic} />}
            {current.type && <input type="hidden" name="type" value={current.type} />}
            <input
              type="search"
              name="q"
              defaultValue={current.q}
              placeholder="Search titles and summaries"
              aria-label="Search the log"
            />
          </form>
        </div>
      </section>

      {visible.length === 0 ? (
        <Empty
          title={posts.length === 0 && !current.q ? 'Nothing logged yet.' : 'No entries match these filters.'}
          adminPath={posts.length === 0 && !current.q ? '/admin/collections/posts/create' : undefined}
        />
      ) : (
        <ol className="log">
          {visible.map((post) => {
            const cover = media(post.coverImage)
            return (
              <li key={post.id} className="entry">
                <time className="entry__date" dateTime={dayKey(post.publishedDate)}>
                  {formatDay(dayKey(post.publishedDate))}
                </time>
                <div className="entry__main">
                  <p className="entry__type">{typeLabel(post.type)}</p>
                  <h2 className="entry__title">
                    <Link href={`/log/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="entry__excerpt">{post.excerpt}</p>
                  <ul className="tags">
                    {populatedList<Topic>(post.topics).map((topic) => (
                      <li key={topic.id}>
                        <span className="dot" data-color={topic.color} aria-hidden="true" />
                        {topic.title}
                      </li>
                    ))}
                  </ul>
                </div>
                {cover && (
                  <Image
                    className="entry__cover"
                    src={cover.url}
                    alt=""
                    width={320}
                    height={214}
                    sizes="160px"
                  />
                )}
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}

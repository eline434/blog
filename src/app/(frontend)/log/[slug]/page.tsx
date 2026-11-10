import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FEEDBACK_SOURCES, POST_TYPES } from '@/collections/Posts'
import { RichText } from '@/components/RichText'
import { getPost, media, populated, populatedList } from '@/lib/data'
import { dayKey, formatDay } from '@/lib/dates'
import type { TeamMember, Topic } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  return post ? { title: post.title, description: post.excerpt } : {}
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  const cover = media(post.coverImage)
  const authors = populatedList<TeamMember>(post.authors)
  const typeLabel = POST_TYPES.find((type) => type.value === post.type)?.label
  const feedback = post.type === 'feedback' ? post.feedback : null
  const ai = post.type === 'ai' ? post.ai : null

  return (
    <article className="post">
      <Link className="back" href={`/?type=${post.type}`}>
        ← All {typeLabel?.toLowerCase()} entries
      </Link>

      <header className="post__header">
        <p className="entry__type">{typeLabel}</p>
        <h1>{post.title}</h1>
        <p className="post__excerpt">{post.excerpt}</p>
        <div className="post__meta">
          <time dateTime={dayKey(post.publishedDate)}>{formatDay(dayKey(post.publishedDate))}</time>
          {authors.length > 0 && <span>{authors.map((author) => author.name).join(', ')}</span>}
        </div>
        <ul className="tags">
          {populatedList<Topic>(post.topics).map((topic) => (
            <li key={topic.id}>
              <Link href={`/?topic=${topic.slug}`}>
                <span className="dot" data-color={topic.color} aria-hidden="true" />
                {topic.title}
              </Link>
            </li>
          ))}
        </ul>
      </header>

      {cover?.width && cover.height && (
        <Image
          className="post__cover"
          src={cover.url}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 760px) 100vw, 720px"
          priority
        />
      )}

      {feedback && (
        <dl className="facts">
          <div>
            <dt>Feedback from</dt>
            <dd>{FEEDBACK_SOURCES.find((source) => source.value === feedback.source)?.label}</dd>
          </div>
          {feedback.people && (
            <div>
              <dt>Who was there</dt>
              <dd>{feedback.people}</dd>
            </div>
          )}
        </dl>
      )}

      {ai && (
        <section className="ai" aria-label="How AI was used">
          <dl>
            <div>
              <dt>Tool(s) used</dt>
              <dd>{ai.tools}</dd>
            </div>
            <div>
              <dt>What we asked</dt>
              <dd>{ai.asked}</dd>
            </div>
            <div>
              <dt>What we kept</dt>
              <dd>{ai.kept}</dd>
            </div>
            <div>
              <dt>What was wrong or rejected</dt>
              <dd>{ai.rejected}</dd>
            </div>
            <div>
              <dt>How we checked it</dt>
              <dd>{ai.verified}</dd>
            </div>
          </dl>
        </section>
      )}

      {post.body && <RichText data={post.body} />}

      {feedback?.actions && feedback.actions.length > 0 && (
        <section className="post__section">
          <h2>What we are doing with it</h2>
          <ul className="actions">
            {feedback.actions.map((item) => (
              <li key={item.id}>
                <span className="actions__state">{item.done ? '● Done' : '○ Open'}</span>
                <span>{item.action}</span>
                <span className="actions__owner">{populated(item.owner)?.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {post.gallery && post.gallery.length > 0 && (
        <section className="post__section">
          <h2>Visual documentation</h2>
          <div className="gallery">
            {post.gallery.map((item) => {
              const image = media(item.image)
              if (image?.mimeType?.startsWith('video/')) {
                return (
                  <figure key={item.id} className="figure">
                    <video src={image.url} controls playsInline preload="metadata" aria-label={image.alt} />
                    {item.caption && <figcaption>{item.caption}</figcaption>}
                  </figure>
                )
              }
              if (!image?.width || !image.height) return null
              return (
                <figure key={item.id} className="figure">
                  <a href={image.url}>
                    <Image
                      src={image.url}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(max-width: 760px) 100vw, 360px"
                    />
                  </a>
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              )
            })}
          </div>
        </section>
      )}

      {post.sources && post.sources.length > 0 && (
        <section className="post__section">
          <h2>Sources</h2>
          <ul className="sources">
            {post.sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} rel="noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

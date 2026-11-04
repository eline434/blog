import type { Metadata } from 'next'

import { Chips } from '@/components/Chips'
import { Empty } from '@/components/Empty'
import { ScrollTo } from '@/components/ScrollTo'
import {
  filterHref,
  getTeam,
  getTimeEntries,
  getTopics,
  param,
  populated,
  type SearchParams,
} from '@/lib/data'
import { addDays, dayKey, daysBetween, formatHours, formatShort, formatWeekday, isMonday } from '@/lib/dates'
import type { TeamMember, TimeEntry, Topic } from '@/payload-types'

export const metadata: Metadata = { title: 'Hours' }

const sum = (entries: TimeEntry[]) => entries.reduce((total, entry) => total + entry.hours, 0)

/** Clean axis steps, at most four gridlines above zero. */
const axisStep = (max: number): number =>
  [1, 2, 4, 5, 10, 20, 25, 50, 100].find((step) => max / step <= 4) ?? 200

export default async function HoursPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams
  const current = { topic: param(raw.topic), member: param(raw.member) }
  const [topics, team, allEntries] = await Promise.all([getTopics(), getTeam(), getTimeEntries()])

  const entries = allEntries.filter(
    (entry) =>
      (!current.topic || populated<Topic>(entry.topic)?.slug === current.topic) &&
      (!current.member || String(populated<TeamMember>(entry.member)?.id) === current.member),
  )

  const byDay = new Map<string, TimeEntry[]>()
  for (const entry of entries) {
    const key = dayKey(entry.date)
    byDay.set(key, [...(byDay.get(key) ?? []), entry])
  }

  // The axis covers all logged days, so filtering never shifts the dates under the reader.
  const allKeys = allEntries.map((entry) => dayKey(entry.date)).sort()
  const today = dayKey(new Date())
  const firstDay = allKeys[0]
  const lastDay = allKeys.length ? (allKeys[allKeys.length - 1] > today ? allKeys[allKeys.length - 1] : today) : today
  const calendar = firstDay
    ? Array.from({ length: daysBetween(firstDay, lastDay) + 1 }, (_, index) => addDays(firstDay, index))
    : []

  const total = sum(entries)
  const daysWorked = byDay.size
  const busiest = Math.max(0, ...[...byDay.values()].map(sum))
  const step = axisStep(busiest)
  const axisMax = Math.max(step, Math.ceil(busiest / step) * step)
  const ticks = Array.from({ length: axisMax / step + 1 }, (_, index) => index * step)

  const topicTotals = topics
    .map((topic) => ({
      topic,
      hours: sum(entries.filter((entry) => populated<Topic>(entry.topic)?.id === topic.id)),
    }))
    .filter((row) => row.hours > 0)

  const memberTotals = team
    .map((member) => ({
      member,
      hours: sum(entries.filter((entry) => populated<TeamMember>(entry.member)?.id === member.id)),
    }))
    .filter((row) => row.hours > 0)
    .sort((a, b) => b.hours - a.hours)

  const days = [...byDay.entries()].sort(([a], [b]) => (a < b ? 1 : -1))

  return (
    <>
      <h1 className="page-title">Hours</h1>

      <section className="filters" aria-label="Filters">
        <Chips
          large
          label="Topic"
          chips={[
            { label: 'All', href: filterHref('/hours', current, { topic: undefined }), active: !current.topic },
            ...topics.map((topic) => ({
              label: topic.title,
              href: filterHref('/hours', current, { topic: topic.slug }),
              active: current.topic === topic.slug,
              color: topic.color,
            })),
          ]}
        />
        {team.length > 0 && (
          <Chips
            label="Person"
            chips={[
              { label: 'Everyone', href: filterHref('/hours', current, { member: undefined }), active: !current.member },
              ...team.map((member) => ({
                label: member.name,
                href: filterHref('/hours', current, { member: String(member.id) }),
                active: current.member === String(member.id),
              })),
            ]}
          />
        )}
      </section>

      {entries.length === 0 ? (
        <Empty
          title={allEntries.length === 0 ? 'No hours logged yet.' : 'No hours match these filters.'}
          adminPath={allEntries.length === 0 ? '/admin/collections/time-entries/create' : undefined}
        />
      ) : (
        <>
          <div className="stats">
            <div className="stat stat--hero">
              <span className="stat__label">Total hours</span>
              <span className="stat__value">{formatHours(total)}</span>
            </div>
            <div className="stat">
              <span className="stat__label">Days worked</span>
              <span className="stat__value">{daysWorked}</span>
            </div>
            <div className="stat">
              <span className="stat__label">Average per day worked</span>
              <span className="stat__value">{formatHours(Math.round((total / daysWorked) * 10) / 10)}</span>
            </div>
          </div>

          <section className="panel" aria-labelledby="per-day">
            <h2 id="per-day" className="panel__title">
              Hours per day
            </h2>
            {topicTotals.length > 1 && (
              <ul className="legend">
                {topicTotals.map(({ topic }) => (
                  <li key={topic.id}>
                    <span className="dot" data-color={topic.color} aria-hidden="true" />
                    {topic.title}
                  </li>
                ))}
              </ul>
            )}
            <div className="chart">
              <div className="chart__y" aria-hidden="true">
                {ticks.map((tick) => (
                  <span key={tick} style={{ bottom: `${(tick / axisMax) * 100}%` }}>
                    {tick}
                  </span>
                ))}
              </div>
              <ScrollTo className="chart__scroll">
                <div className="chart__inner" style={{ minWidth: `${calendar.length * 10}px` }}>
                  <div className="chart__plot">
                    {ticks.map((tick) => (
                      <i key={tick} className="chart__grid" style={{ bottom: `${(tick / axisMax) * 100}%` }} />
                    ))}
                    {calendar.map((key, index) => {
                      const dayEntries = byDay.get(key) ?? []
                      const dayTotal = sum(dayEntries)
                      const parts = topics
                        .map((topic) => ({
                          topic,
                          hours: sum(dayEntries.filter((entry) => populated<Topic>(entry.topic)?.id === topic.id)),
                        }))
                        .filter((part) => part.hours > 0)
                      const summary = `${formatWeekday(key)}: ${formatHours(dayTotal)} hours`
                      return (
                        <div
                          key={key}
                          className="col"
                          data-scroll-target={index === calendar.length - 1 ? '' : undefined}
                          tabIndex={dayTotal > 0 ? 0 : undefined}
                          aria-label={
                            dayTotal > 0
                              ? `${summary}. ${parts.map((part) => `${part.topic.title} ${formatHours(part.hours)}`).join(', ')}`
                              : undefined
                          }
                        >
                          {parts.map((part) => (
                            <span
                              key={part.topic.id}
                              className="seg"
                              data-color={part.topic.color}
                              style={{ height: `${(part.hours / axisMax) * 100}%` }}
                            />
                          ))}
                          {dayTotal > 0 && (
                            <div className={index > calendar.length / 2 ? 'tip tip--left' : 'tip'} role="presentation">
                              <strong>{summary}</strong>
                              {parts.map((part) => (
                                <span key={part.topic.id} className="tip__row">
                                  <span className="dot" data-color={part.topic.color} />
                                  {part.topic.title}
                                  <b>{formatHours(part.hours)}</b>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="chart__x" aria-hidden="true">
                    {calendar.map((key) => (
                      <span key={key}>{isMonday(key) && <em>{formatShort(key)}</em>}</span>
                    ))}
                  </div>
                </div>
              </ScrollTo>
            </div>
          </section>

          <div className="split">
            {topicTotals.length > 1 && (
              <section className="panel" aria-labelledby="per-topic">
                <h2 id="per-topic" className="panel__title">
                  Share per topic
                </h2>
                <div className="segbar">
                  {topicTotals.map(({ topic, hours }) => {
                    const share = Math.round((hours / total) * 100)
                    return (
                      <span
                        key={topic.id}
                        data-color={topic.color}
                        style={{ flexGrow: hours }}
                        title={`${topic.title}: ${formatHours(hours)} hours, ${share}%`}
                      >
                        {share >= 10 && `${share}%`}
                      </span>
                    )
                  })}
                </div>
                <ul className="rows">
                  {topicTotals.map(({ topic, hours }) => (
                    <li key={topic.id}>
                      <span className="dot" data-color={topic.color} aria-hidden="true" />
                      <span>{topic.title}</span>
                      <b>{formatHours(hours)} h</b>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {memberTotals.length > 0 && (
              <section className="panel" aria-labelledby="per-person">
                <h2 id="per-person" className="panel__title">
                  Per person
                </h2>
                <ul className="bars">
                  {memberTotals.map(({ member, hours }) => (
                    <li key={member.id}>
                      <span>{member.name}</span>
                      <span className="bars__track">
                        <i style={{ width: `${(hours / memberTotals[0].hours) * 100}%` }} />
                      </span>
                      <b>{formatHours(hours)} h</b>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <section aria-labelledby="day-by-day">
            <h2 id="day-by-day" className="section-title">
              Day by day
            </h2>
            <ol className="days">
              {days.map(([key, dayEntries]) => (
                <li key={key} className="day">
                  <div className="day__head">
                    <time dateTime={key}>{formatWeekday(key)}</time>
                    <b>{formatHours(sum(dayEntries))} h</b>
                  </div>
                  <ul>
                    {dayEntries.map((entry) => {
                      const topic = populated<Topic>(entry.topic)
                      return (
                        <li key={entry.id} className="line">
                          <span className="line__who">{populated<TeamMember>(entry.member)?.name}</span>
                          <span className="line__topic">
                            <span className="dot" data-color={topic?.color} aria-hidden="true" />
                            {topic?.title}
                          </span>
                          <span className="line__what">{entry.description}</span>
                          <b className="line__hours">{formatHours(entry.hours)} h</b>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </>
  )
}

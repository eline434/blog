import type { Metadata } from 'next'

import { TASK_STATUSES } from '@/collections/Tasks'
import { Chips } from '@/components/Chips'
import { Empty } from '@/components/Empty'
import { ScrollTo } from '@/components/ScrollTo'
import { filterHref, getTasks, getTopics, param, populated, type SearchParams } from '@/lib/data'
import { addDays, dayKey, daysBetween, formatDay, formatShort, startOfWeek } from '@/lib/dates'
import type { Task, TeamMember, Topic } from '@/payload-types'

export const metadata: Metadata = { title: 'Planning' }

const STATUS_MARK: Record<Task['status'], string> = { todo: '○', doing: '◐', done: '●', blocked: '!' }
const statusLabel = (status: Task['status']) =>
  TASK_STATUSES.find((option) => option.value === status)?.label ?? status

const taskEnd = (task: Task) => dayKey(task.isMilestone || !task.endDate ? task.startDate : task.endDate)

export default async function PlanningPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams
  const current = { topic: param(raw.topic) }
  const [topics, allTasks] = await Promise.all([getTopics(), getTasks()])
  const tasks = allTasks.filter(
    (task) => !current.topic || populated<Topic>(task.topic)?.slug === current.topic,
  )

  const filters = (
    <section className="filters" aria-label="Filters">
      <Chips
        large
        label="Topic"
        chips={[
          { label: 'All', href: filterHref('/planning', current, { topic: undefined }), active: !current.topic },
          ...topics.map((topic) => ({
            label: topic.title,
            href: filterHref('/planning', current, { topic: topic.slug }),
            active: current.topic === topic.slug,
            color: topic.color,
          })),
        ]}
      />
    </section>
  )

  if (tasks.length === 0) {
    return (
      <>
        <h1 className="page-title">Planning</h1>
        {filters}
        <Empty
          title={allTasks.length === 0 ? 'No planning added yet.' : 'No planning items for this topic.'}
          adminPath={allTasks.length === 0 ? '/admin/collections/tasks/create' : undefined}
        />
      </>
    )
  }

  // The time axis covers all items, so filtering a topic keeps every bar in the same place.
  const firstDay = startOfWeek(allTasks.map((task) => dayKey(task.startDate)).sort()[0])
  const latest = allTasks.map(taskEnd).sort().at(-1)!
  const weekCount = Math.floor(daysBetween(firstDay, latest) / 7) + 1
  const dayCount = weekCount * 7
  const position = (key: string) => (daysBetween(firstDay, key) / dayCount) * 100
  const weeks = Array.from({ length: weekCount }, (_, index) => addDays(firstDay, index * 7))
  const today = dayKey(new Date())
  const todayInRange = today >= firstDay && daysBetween(firstDay, today) < dayCount

  const groups = topics
    .map((topic) => ({
      topic,
      tasks: tasks.filter((task) => populated<Topic>(task.topic)?.id === topic.id),
    }))
    .filter((group) => group.tasks.length > 0)

  const track = {
    backgroundSize: `${100 / weekCount}% 100%`,
  }

  return (
    <>
      <h1 className="page-title">Planning</h1>
      {filters}

      <section className="panel" aria-labelledby="timeline">
        <h2 id="timeline" className="panel__title">
          Timeline
        </h2>
        <ul className="legend">
          {TASK_STATUSES.map((status) => (
            <li key={status.value}>
              <span className="gantt__legend-bar" data-status={status.value} aria-hidden="true" />
              {status.label}
            </li>
          ))}
          <li>
            <span className="gantt__legend-milestone" aria-hidden="true" />
            Milestone
          </li>
          {groups.length > 1 &&
            groups.map(({ topic }) => (
              <li key={topic.id}>
                <span className="dot" data-color={topic.color} aria-hidden="true" />
                {topic.title}
              </li>
            ))}
        </ul>
        <ScrollTo className="gantt__scroll">
          <div className="gantt" style={{ minWidth: `${220 + weekCount * 64}px` }}>
            <div className="gantt__row gantt__row--head">
              <span className="gantt__name" />
              <div className="gantt__weeks">
                {weeks.map((week) => (
                  <span key={week}>{formatShort(week)}</span>
                ))}
                {todayInRange && (
                  <i
                    className="gantt__today-label"
                    data-scroll-target=""
                    style={{ left: `${position(today)}%` }}
                  >
                    Today
                  </i>
                )}
              </div>
            </div>
            {groups.flatMap(({ topic, tasks: groupTasks }) =>
              groupTasks.map((task) => {
                const start = dayKey(task.startDate)
                const end = taskEnd(task)
                return (
                  <div key={task.id} className="gantt__row">
                    <span className="gantt__name" title={task.title}>
                      <span aria-label={statusLabel(task.status)}>{STATUS_MARK[task.status]}</span> {task.title}
                    </span>
                    <div className="gantt__track" style={track}>
                      {todayInRange && <i className="gantt__today" style={{ left: `${position(today)}%` }} />}
                      {task.isMilestone ? (
                        <span
                          className="gantt__milestone"
                          data-color={topic.color}
                          style={{ left: `${position(start) + 50 / dayCount}%` }}
                          title={`${task.title}: ${formatDay(start)}`}
                        />
                      ) : (
                        <span
                          className="gantt__bar"
                          data-color={topic.color}
                          data-status={task.status}
                          style={{
                            left: `${position(start)}%`,
                            width: `${((daysBetween(start, end) + 1) / dayCount) * 100}%`,
                          }}
                          title={`${task.title}: ${formatDay(start)} to ${formatDay(end)}, ${statusLabel(task.status)}`}
                        />
                      )}
                    </div>
                  </div>
                )
              }),
            )}
          </div>
        </ScrollTo>
      </section>

      <section aria-labelledby="all-items">
        <h2 id="all-items" className="section-title">
          All items
        </h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Topic</th>
                <th scope="col">Owner</th>
                <th scope="col">When</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const topic = populated<Topic>(task.topic)
                const start = dayKey(task.startDate)
                const end = taskEnd(task)
                return (
                  <tr key={task.id}>
                    <td data-label="Item">
                      <strong>{task.title}</strong>
                      {task.notes && <p className="table__note">{task.notes}</p>}
                    </td>
                    <td data-label="Topic">
                      <span className="dot" data-color={topic?.color} aria-hidden="true" /> {topic?.title}
                    </td>
                    <td data-label="Owner">{populated<TeamMember>(task.owner)?.name ?? '–'}</td>
                    <td data-label="When" className="table__mono">
                      {task.isMilestone ? formatDay(start) : `${formatShort(start)} – ${formatDay(end)}`}
                    </td>
                    <td data-label="Status">
                      {STATUS_MARK[task.status]} {statusLabel(task.status)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Empty } from '@/components/Empty'
import { getTeam, getTimeEntries, media, populated, populatedList } from '@/lib/data'
import { formatHours } from '@/lib/dates'
import type { TeamMember, Topic } from '@/payload-types'

export const metadata: Metadata = { title: 'Team' }

export default async function TeamPage() {
  const [team, entries] = await Promise.all([getTeam(), getTimeEntries()])

  const hoursOf = (id: number) =>
    entries
      .filter((entry) => populated<TeamMember>(entry.member)?.id === id)
      .reduce((total, entry) => total + entry.hours, 0)

  return (
    <>
      <h1 className="page-title">Team</h1>
      {team.length === 0 ? (
        <Empty title="No team members added yet." adminPath="/admin/collections/team-members/create" />
      ) : (
        <ul className="team">
          {team.map((member) => {
            const photo = media(member.photo)
            return (
              <li key={member.id} className="member">
                {photo && (
                  <Image
                    className="member__photo"
                    src={photo.url}
                    alt=""
                    width={160}
                    height={160}
                    sizes="80px"
                  />
                )}
                <h2>{member.name}</h2>
                <p className="member__role">{member.role}</p>
                {populatedList<Topic>(member.topics).length > 0 && (
                  <ul className="tags">
                    {populatedList<Topic>(member.topics).map((topic) => (
                      <li key={topic.id}>
                        <span className="dot" data-color={topic.color} aria-hidden="true" />
                        {topic.title}
                      </li>
                    ))}
                  </ul>
                )}
                {member.responsibilities && member.responsibilities.length > 0 && (
                  <ul className="member__list">
                    {member.responsibilities.map((item) => (
                      <li key={item.id}>{item.item}</li>
                    ))}
                  </ul>
                )}
                <Link className="member__hours" href={`/hours?member=${member.id}`}>
                  {formatHours(hoursOf(member.id))} hours logged →
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

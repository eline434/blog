import Link from 'next/link'

export function Empty({ title, adminPath }: { title: string; adminPath?: string }) {
  return (
    <div className="empty">
      <p>{title}</p>
      {adminPath && <Link href={adminPath}>Add one in the admin</Link>}
    </div>
  )
}

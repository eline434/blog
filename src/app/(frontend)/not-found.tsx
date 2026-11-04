import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="empty">
      <p>This page does not exist, or the entry is not published yet.</p>
      <Link href="/">Back to the log</Link>
    </div>
  )
}

// Dates are grouped in Belgian time. A date picked at local midnight is stored as 23:00 UTC
// the day before, so grouping in UTC would put hours on the wrong day.
const TIME_ZONE = 'Europe/Brussels'
const DAY_MS = 86_400_000

const keyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** A calendar day as YYYY-MM-DD. */
export const dayKey = (value: string | Date): string => keyFormat.format(new Date(value))

const keyToUtc = (key: string): number => Date.parse(`${key}T00:00:00Z`)

export const addDays = (key: string, days: number): string =>
  new Date(keyToUtc(key) + days * DAY_MS).toISOString().slice(0, 10)

export const daysBetween = (from: string, to: string): number =>
  Math.round((keyToUtc(to) - keyToUtc(from)) / DAY_MS)

/** The Monday of the week this day falls in. */
export const startOfWeek = (key: string): string => {
  const weekday = new Date(keyToUtc(key)).getUTCDay()
  return addDays(key, weekday === 0 ? -6 : 1 - weekday)
}

export const isMonday = (key: string): boolean => new Date(keyToUtc(key)).getUTCDay() === 1

const longFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const shortFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
})
const weekdayFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

export const formatDay = (key: string): string => longFormat.format(keyToUtc(key))
export const formatShort = (key: string): string => shortFormat.format(keyToUtc(key))
export const formatWeekday = (key: string): string => weekdayFormat.format(keyToUtc(key))

/** 7.5 stays 7.5, 8 stays 8, and rounding noise from adding quarters disappears. */
export const formatHours = (hours: number): string => String(Math.round(hours * 100) / 100)

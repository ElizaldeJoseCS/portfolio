import type { ExperienceArea, Track } from '@/types'

export interface FilterOption<T extends string> {
  value: T
  label: string
}

/* ------------------------------------------------------------------- track */

export type TrackFilterValue = 'all' | 'swe' | 'game'

export const TRACK_OPTIONS: readonly FilterOption<TrackFilterValue>[] = [
  { value: 'all', label: 'All' },
  { value: 'swe', label: 'Software' },
  { value: 'game', label: 'Games' },
]

/**
 * Whether a tagged item survives the current filter. `both` always does, and
 * so does anything with no tag at all — an untagged item is not a hidden item.
 *
 * Lives here rather than beside `FilterBar` because a module that exports a
 * component and a helper breaks react-refresh's boundary, and every page
 * imports this without rendering the control.
 */
export const matchesTrack = (track: Track[] | undefined, filter: TrackFilterValue) =>
  filter === 'all' || !track || track.includes(filter) || track.includes('both')

/* -------------------------------------------------------------------- area */

export type AreaFilterValue = 'all' | ExperienceArea

export const AREA_OPTIONS: readonly FilterOption<AreaFilterValue>[] = [
  { value: 'all', label: 'All' },
  { value: 'research', label: 'Research' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
]

/**
 * The Experience page's filter. Unlike `matchesTrack` this is exclusive —
 * every entry has exactly one area, so nothing is a member of two categories
 * and there is no `both`.
 */
export const matchesArea = (area: ExperienceArea, filter: AreaFilterValue) =>
  filter === 'all' || area === filter

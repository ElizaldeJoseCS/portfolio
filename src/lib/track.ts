import type { Track } from '@/types'

export type TrackFilterValue = 'all' | 'swe' | 'game'

/**
 * Whether a tagged item survives the current filter. `both` always does, and
 * so does anything with no tag at all — an untagged item is not a hidden item.
 *
 * Lives here rather than beside `TrackFilter` because a module that exports a
 * component and a helper breaks react-refresh's boundary, and every page
 * imports this without rendering the control.
 */
export const matchesTrack = (track: Track[] | undefined, filter: TrackFilterValue) =>
  filter === 'all' || !track || track.includes(filter) || track.includes('both')

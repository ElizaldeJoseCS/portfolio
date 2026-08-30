import { useEffect, useState } from 'react'
import { probeGpu } from '@/lib/gpu'

/**
 * `null` while undetermined (SSR / first paint), then a definite boolean.
 * Keeping the tri-state avoids flashing the fallback on capable devices.
 *
 * The probe itself is shared and memoised (`probeGpu`), so this costs nothing
 * beyond the first caller — the quality tier and the door room both ask the
 * same question before this hook runs.
 */
export function useIsWebglSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)
  useEffect(() => setSupported(probeGpu().supported), [])
  return supported
}

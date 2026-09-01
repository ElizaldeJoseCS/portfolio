import type { Publication } from '@/types'

/**
 * Co-authored papers. Each one is hosted here as a PDF as well as linked to its
 * canonical record, so the link still works when a conference site is
 * reorganised — the same reason `resume.pdf` lives in `public/assets`.
 *
 * `experienceId` ties a paper to the research position it came out of, so the
 * Experience page can show the institution's mark beside the paper without
 * the logo being defined twice.
 */
export const publications: Publication[] = [
  {
    id: 'chi26-beyond-riding',
    title: 'Beyond Riding: Passenger Engagement with Driver Labor through Gamified Interactions',
    authors: ['Jane Hsieh', 'Emmie Regan', 'Jose Elizalde', 'Sophia Deng', 'Haiyi Zhu'],
    venue: 'CHI 2026 — ACM Conference on Human Factors in Computing Systems, Barcelona',
    year: '2026',
    abstract:
      'Ridehail platforms hide the real labour, logistics and costs of driving from the passengers who buy it. Across nine think-aloud workshops with 19 drivers and 15 passengers, we tested whether gamified in-ride interactions can surface those conditions — closing passenger knowledge gaps around pay, rating pressure and long-term consequences, and shifting how passengers read their own power in the exchange. The paper sets out design guidelines for passenger-driver interactions that motivate solidarity rather than just satisfaction.',
    pdf: '/assets/paper-chi26-beyond-riding.pdf',
    doi: 'https://doi.org/10.1145/3772318.3791294',
    contribution:
      'Built the interactive application the study ran on at CMU’s HCI Institute, and iterated its features from usability testing across the workshops.',
    experienceId: 'cmu-reuse',
  },
  {
    id: 'transfer-systems',
    title: 'Transfer Systems on the Partially Ordered Set Xₙ₊⁺',
    authors: ['Jose Elizalde', 'Yanilette Montano'],
    venue: 'UCLA SURE C² program — presented at the University of Texas at Arlington',
    year: '2026',
    abstract:
      'An enumeration of the transfer systems on Xₙ₊, the discrete poset Xₙ with a minimal and a maximal element added. Working the cases n = 0 through n = 3 out by hand and by machine, we identify a consistent formula for the number of transfer systems at any n and propose general rules governing their structure.',
    pdf: '/assets/paper-transfer-systems.pdf',
    contribution:
      'Wrote the C++ enumerator that counts every transfer system of a given finite poset — the count grows exponentially in the size of the set — and found the recursive relationship the formula is built on.',
    experienceId: 'ucla-sure',
  },
]

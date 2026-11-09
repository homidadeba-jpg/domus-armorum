export const partners = [
  { id: 'ghost', name: 'Ghost Holster', country: 'italy', relation: 'exclusive', tone: 'dark', line: 'holstersLine' },
  { id: 'konus', name: 'Konus Optics', country: 'italy', relation: 'exclusive', tone: 'dark', line: 'opticsLine' },
  { id: 'sightron', name: 'Sightron', country: 'usa', relation: 'representation', tone: 'light', line: 'opticsLine' },
  { id: 'hornady', name: 'Hornady', relation: 'distribution', tone: 'dark', line: 'hornadyLine' },
  { id: 'cbc', name: 'CBC', relation: 'distribution', tone: 'dark', line: 'ammunitionLine' },
  { id: 'federal', name: 'Federal', relation: 'distribution', tone: 'dark', line: 'ammunitionLine' },
  { id: 'cci', name: 'CCI', relation: 'distribution', tone: 'light', line: 'ammunitionLine' },
  { id: 'fiocchi', name: 'Fiocchi', relation: 'distribution', tone: 'dark', line: 'ammunitionLine' },
  { id: 'dfa', name: 'DFA Defense', country: 'brazil', relation: 'distribution', tone: 'dark', line: 'brazilIndustryLine' },
  { id: 'fireeagle', name: 'Fire Eagle Armory', country: 'brazil', relation: 'distribution', tone: 'dark', line: 'brazilIndustryLine' },
  { id: 'topgun', name: 'Top Gun', relation: 'distribution', tone: 'dark', line: 'cleaningLine' },
  { id: 'raoni', name: 'Raoni Tactical', relation: 'distribution', tone: 'light', line: 'raoniLine' },
];

// Replace null with /experiences/visit-....webp when the owner's photographs arrive.
// These slots are omitted from public rendering until an actual photograph is supplied.
export const ownerArchive = [
  { id: 'factory-wide', image: null, caption: 'archiveFactory', format: 'landscape' },
  { id: 'factory-detail', image: null, caption: 'archivePeople', format: 'portrait' },
  { id: 'italy-fair', image: null, caption: 'archiveFair', format: 'panorama' },
];

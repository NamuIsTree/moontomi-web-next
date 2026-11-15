export const CACHE_TAGS = {
  home: "home",
  lectures: "lectures",
  reviews: "reviews",
  archives: "archives",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

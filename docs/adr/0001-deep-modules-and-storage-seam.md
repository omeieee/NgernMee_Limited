# 0001. Decouple Data Persistence via Storage Seam

The application store (`useAppStore.ts`) previously coupled reactive client state with low-level Supabase queries and LocalStorage fallbacks, causing frequent sync regressions and preventing automated testing. We decided to establish a clean **Storage Seam** backed by two concrete adapters (`SupabaseStorageAdapter` for authenticated cloud persistence and `LocalStorageAdapter` for offline demo mode and headless testing), making persistence swappable without editing state coordination logic.

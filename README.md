# 🪶 FeatherQuery

![logo](assets/mainLogoWithBgTr.png)

#### This version is the first stable version. If you see any problems, contact with me via email (mehemmedkazimzade54@gmail.com) or feel free to create PRs. 

Data fetching, light as a **feather**.
A lightweight React library for fetching, caching, and mutating API data with minimal boilerplate.

## ✨ Why FeatherQuery?

Modern data-fetching libraries like TanStack Query or RTK Query are powerful, but they often feel heavy and require tons of setup. FeatherQuery is designed to be:

-   🪶 Lightweight – no clutter, no extra configs

-   ⚡ Fast & efficient – built with caching, refetching, and mutations in mind

-   🎯 Simple API – just drop in a hook and go

-   🔧 Extensible – start simple, scale when needed

## 🚀 Features (Hooks)

## useQueryClient

### Overview

A React hook that provides access to the appropriate cache instance based on the specified cache mode. Must be used within a QueryProvider context.

### Usage

```typescript

import useQueryClient from './useQueryClient';

function MyComponent() {
    const { cache } = useQueryClient('session'); // or 'volatile', 'permanent'
    
    // Use cache methods
    const data = cache.get(['my-data']);
    cache.set(['my-data'], { value: 'test' });
}
```

### Cache Modes

`volatile (default)` - In-memory cache, clears on page refresh

`session` - Persists for the browser session only

`permanent` - Persists until manually cleared

### Returns

`cache: Cache` - The cache instance for the specified mode

Context Requirement

## **All the hooks must be used within a QueryProvider component, otherwise throws an error.**

### `useFetch` 

Is a lightweight React hook for fetching data from an API in the simplest way possible. It’s ideal when you just want to fetch and display data without setting up complex state management.

The hook **returns**:

_data_ – the fetched data (or null if not yet loaded)

_status_ – the current status: "IDLE", "LOADING", "SUCCESS", or "ERROR"

_error_ – any error encountered during fetching

_isLoading_ – boolean, true while the request is in progress

_isIdle_ – boolean, true if no request has been made yet

_refetch_ – a function to manually trigger a new request

Optional pollInterval lets you repeatedly fetch data at a given interval. All requests sent from pollInterval refetch data even if it is non-stale. Requests are automatically aborted on refetch or unmount, so you don’t have to worry about race conditions.

```typescript
const { data, status, error, isLoading, refetch } = useFetch<User[]>('/api/users', {
  pollInterval: 5000,
});

if (isLoading) return <p>Loading...</p>;
if (error) return <p>Error: {error.message}</p>;

return (
  <ul>
    {data?.map(user => <li key={user.id}>{user.name}</li>)}
  </ul>
);

```

This keeps it beginner-friendly, explains what it returns, and shows a clear minimal usage.


## `useQuery`

#### A powerful React hook for data fetching with built-in caching, polling, error handling, and request management. Provides type-safe asynchronous data fetching with optimal performance characteristics

### Features

- Automatic caching with configurable strategies
- Request deduplication and cancellation
- Polling support with customizable intervals
- Stale-time management for fresh data
- Comprehensive error handling system
- TypeScript support with generics
- Multiple cache persistence modes

**Usage**
```ts
const { data, error, status, refetch } = useQuery(
    ['user', userId],
    (signal) => fetchUser(userId, signal),
    {
        staleTime: 60_000 // data is stale after 1 min,
        pollInterval: 10_000 // refetch every 10 secs,
        onSuccess: (data) => console.log('Data loaded:', data)
    }
);
```

## API Reference

### Parameters:
- `key: any[]` - Unique identifier for caching
- `fetcher: (signal: AbortSignal) => Promise<T>` - Data fetching function
- `options?: QueryOptions<T>` - Configuration object

### Options:

- `staleTime: number (default: 30000)` - Milliseconds until data is stale

- `pollInterval: number` - Auto-refetch interval in ms

- `onSuccess: (data: T) => void` - Success callback

- `onError: (error: Error) => void` - Error callback

- `onSettled: (data: T|null, error: Error|null) => void` - Completion callback

- `cacheMode: 'permanent'|'volatile'|'session'` - Cache persistence mode

### Return Value

- `data: T | null` - Fetched data or null

- `error: Error | null` - Error object if request failed

- `status: string` - Current status ('STATIC', 'LOADING', 'FETCHING', 'ERROR')

- `refetch: () => Promise<void>` - Manual refetch function

### Status States

- `STATIC` - Initial state before fetching

- `LOADING` - First fetch in progress

- `FETCHING` - Background refetch with stale data visible

- `ERROR` - Fetch failed with error


### Caching Behavior

- Data cached by serialized key array

- Stale data served immediately while background refetch occurs

- Automatic cache updates on successful fetches

- Manual invalidation via key changes or external cache methods

### Performance Optimizations

- Request deduplication for identical keys

- AbortController cancellation for unmounted components

- Memoized key comparison to prevent unnecessary re-renders

- Background polling without UI state changes

- Stale-while-revalidate pattern for smooth UX


## `useMutation`

### Overview

A React hook for handling data mutations (create, update, delete operations) with built-in optimistic updates, retry logic, and cache management. Perfect for forms, actions, and any data-modifying operations.


### Featues

- Optimistic updates for instant UI feedback
- Automatic retry mechanism with configurable delay
- Cache invalidation for related queries
- Error handling with rollback capability
- Multiple execution modes (sync and async)
- Request deduplication and cancellation
- TypeScript support with full type safety

### Usage

```typescript
function CreatePost() {
    const { mutate, isLoading, error } = useMutation(
        {
            url: 'your-link/api/posts',
            method: 'POST',
        },
        {
            onSuccess: (data) => console.log('Post created:', data),
            onError: (error) => console.error('Creation failed:', error),
            optimisticUpdate: (cache, variables) => {
                // Optimistically update cache
            },
        }
    );

    const handleSubmit = (formData) => {
        mutate(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Post'}
            </button>
            {error && <div>Error: {error.message}</div>}
        </form>
    );
}
```

### API Reference

```typescript
useMutation<TResponse, TError, TVariables>(
    config: Config<TResponse, TVariables>,
    options?: Options<TResponse, TError, TVariables>
)
```

#### Config Object

(NOTE: Provide either `mutateFn` or `url` + `method`.)

- `mutateFn?: (variables: TVariables) => Promise<TResponse>` - Custom mutation function

- `url?: string` - Endpoint URL (alternative to mutateFn)

- `method?: string` - HTTP method (GET, POST, PUT, DELETE, etc.)

- `headers?: HeadersInit` - Custom request headers

#### Options Object

- `onSuccess?: (response: TResponse, variables: TVariables) => void` - Success callback

- `onError?: (error: TError, variables: TVariables) => void - Error callback

- `onSettled?: (response: TResponse|null, error: TError|null, variables: TVariables) => void` - Completion callback

- `invalidateKeys?: any[]` - Query keys to invalidate after mutation

- `optimisticUpdate?: (cache: Cache, variables: TVariables) => void` - Pre-emptive cache update

- `rollback?: (cache: Cache, variables: TVariables) => void` - Rollback function for failed optimistic updates

- `retries?: number` - Number of retry attempts (default: 0)

- `retryDelay?: (attempt: number) => number - Custom retry delay function

- `cacheMode?: 'permanent'|'volatile'|'session'` - Cache persistence mode

### Status States
- **IDLE** – Initial state before mutation
- **LOADING** – Mutation in progress
- **SUCCESS** – Mutation completed successfully
- **ERROR** – Mutation failed with error

---

### Optimistic Updates with Rollback
- Update cache immediately for a smoother UX
- Rollback changes automatically if mutation fails

```typescript
const { mutate } = useMutation(
  { url: '/api/like', method: 'POST' },
  {
    optimisticUpdate: (cache, variables) => {
      cache.set(['post', variables.postId], (old) => ({
        ...old,
        likes: old.likes + 1,
      }));
    },
    rollback: (cache, variables) => {
      cache.set(['post', variables.postId], (old) => ({
        ...old,
        likes: old.likes - 1,
      }));
    },
  }
);
```

### Retry Mechanism

- Configure automatic retries for failed requests

- Supports custom delay strategies

```typescript
useMutation(
  { url: '/api/upload', method: 'POST' },
  {
    retries: 3,
    retryDelay: (attempt) => 1000 * attempt, // 1s, 2s, 3s delays
  }
);
```

### Cache Invalidation
```typescript
useMutation(
    { url: '/api/comments', method: 'POST' },
    {
        invalidateKeys: ['posts', 'comments'],
        // Invalidates both posts and comments queries after mutation
    }
);
```

### Error Handling with Callbacks
```typescript
const { mutate } = useMutation(
    { url: '/api/user', method: 'POST' },
    {
        onSuccess: (data, variables) => {
            showNotification('User created successfully');
        },
        onError: (error, variables) => {
            showError(`Failed: ${error.message}`);
            logError(error, variables);
        },
        onSettled: (data, error, variables) => {
            trackAnalytics('user_creation', { success: !error, variables });
        }
    }
);
```

### Caching Behavior

- Automatic cache updates through optimistic updates

- Selective cache invalidation via invalidateKeys

- Rollback capability for failed optimistic updates

- Cache mode support for different persistence needs


## `useInfiniteQuery`
useInfiniteQuery is a React hook for handling infinite scrolling or paginated data fetching. It abstracts away the complexity of managing page state, caching, and stale data so you can focus on rendering your list.

### This hook lets you:

- Fetch the next page or previous page on demand.

- Cache pages to avoid unnecessary re-requests.

- Automatically detect and refetch stale data.

- Cancel ongoing requests to prevent race conditions.

- Optionally start with an initial fetch (initialFetch).


### Parameters

- `getPreviousPageParam?: (firstPageParam: string | number) => any` - Function to get previous page parameter

- `initialFetch?: boolean` - Whether to fetch initial page automatically (default: false)

- `staleTime?: number` - Time in ms before data is considered stale (default: 30000)

- `onSuccess?: (data: PagedDataEntry<T>) => void` - Success callback

- `onError?: (error: Error) => void` - Error callback

- `onSettled?: (data: PagedDataEntry<T>|null, error: Error|null) => void` - Completion callback

- `cacheMode?: 'permanent'|'volatile'|'session'` - Cache persistence mode (default: 'volatile')

### Return Value

**Returns an object with:**

- `data: { pages: T[][], pageParams: any[] }` - All loaded pages and their parameters

- `error: Error | null` - Error object if any request failed

- `status: string` - Current status ('IDLE', 'LOADING', 'SUCCESS', 'ERROR')

- `fetchNextPage: () => void` - Function to load the next page

- `fetchPreviousPage: () => void` - Function to load the previous page

### Example Usage
```typescript
// start from page 1 (number)
const {
  data,
  status,
  error,
  fetchNextPage,
  fetchPreviousPage,
} = useInfiniteQuery(
  1, // <-- initial page param (number)
  (page, signal) =>
    fetch(`/api/messages?page=${page}`, { signal }).then((res) => res.json()),
  (lastPageParam) => lastPageParam + 1, // next page number
  {
    getPreviousPageParam: (firstPageParam) =>
      firstPageParam > 1 ? firstPageParam - 1 : undefined,
    initialFetch: true,
  }
);

```

Short rationale / tips:

- The first argument here is the initial page param (a number in page-number APIs).

- getNextPageParam receives the last used page param (a number) and returns the next one.

- Make getPreviousPageParam return undefined when there is no previous page (so you can stop fetching backwards)


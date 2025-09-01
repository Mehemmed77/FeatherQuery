# 🪶 FeatherQuery

![logo](assets/mainLogoWithBgTr.png)

Data fetching, light as a **feather**.
A lightweight React library for fetching, caching, and mutating API data with minimal boilerplate.

## ✨ Why FeatherQuery?

Modern data-fetching libraries like TanStack Query or RTK Query are powerful, but they often feel heavy and require tons of setup. FeatherQuery is designed to be:

-   🪶 Lightweight – no clutter, no extra configs

-   ⚡ Fast & efficient – built with caching, refetching, and mutations in mind

-   🎯 Simple API – just drop in a hook and go

-   🔧 Extensible – start simple, scale when needed

## 🚀 Features

**useFetch** hook streamlines API calls by managing the `loading`, `error`, and `data` states for you. It also includes advanced features like automatic polling and data refetching to keep your interface responsive and data up-to-date.

**useQuery** - Fetch and cache data based on query keys, configure stale time, poll interval however you want.

**useMutation** – Perform POST/PUT/DELETE requests with cache invalidation

**Auto refetch** (intervals & on demand)

**Optional cache policies** (stale time, cache time)

**TypeScript-first design**

**Tiny bundle size**

### 📦 Install

```bash
npm install feather-query
```

### 🛠 Usage

```ts
import { useFetch, useMutation } from 'feather-query';

function Todos() {
    const { data, loading, error, refetch } = useFetch('/api/todos');

    const { mutate: addTodo } = useMutation(async (newTodo) => {
        return fetch('/api/todos', {
            method: 'POST',
            body: JSON.stringify(newTodo),
        }).then((res) => res.json());
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading todos</p>;

    return (
        <>
            <ul>
                {data?.map((todo) => (
                    <li key={todo.id}>{todo.text}</li>
                ))}
            </ul>
            <button onClick={() => refetch()}>Refetch</button>
            <button onClick={() => addTodo({ text: 'Try FeatherQuery' })}>
                Add Todo
            </button>
        </>
    );
}
```

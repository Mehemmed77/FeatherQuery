export default function hashKey(key: unknown): string {
    return Array.isArray(key) ? JSON.stringify(key) : String(key);  
}
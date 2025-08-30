export default function isPrefix(prefix: unknown[], full: unknown[]) {
    return prefix.every((value, index) => full[index] === value);
}
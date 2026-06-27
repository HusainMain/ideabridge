export function isStructuredError(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'code' in data &&
        'message' in data &&
        typeof data.code === 'string' &&
        typeof data.message === 'string');
}

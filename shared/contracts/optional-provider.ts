export type OptionalProviderStatus = 'disabled' | 'ok' | 'timeout' | 'malformed' | 'unavailable';
export type OptionalProviderResponse = { content: string; metadata?: Record<string, unknown> };
export type OptionalProviderResult = { status: OptionalProviderStatus; response?: OptionalProviderResponse; error?: string };

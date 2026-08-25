export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number, public fields: Record<string,string> = {}, public requestId?: string) {super(message); this.name = 'ApiError';}
}


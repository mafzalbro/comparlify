export class NextRequest extends Request {}
export class NextResponse extends Response {
  static json(body: any, init?: ResponseInit) {
    return new NextResponse(JSON.stringify(body), {
      ...init,
      headers: {
        ...init?.headers,
        'content-type': 'application/json',
      },
    });
  }
}
export function userAgent() {
  return {};
}
export function userAgentFromString() {
  return {};
}

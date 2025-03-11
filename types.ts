export type HTTPMethod = (
  'get' | 'post' | 'put' | 'delete'
)

export type RouteDescriber = {
  route: string,
  method: {
    name: HTTPMethod,
    fn: any
  }
}

export type Router = {
  [K in HTTPMethod]: (route: string, handlerFn: (req: Request, res: Response) => any) => any
}

export type Request = {
  url: string,
  params: any,
  body: any
}

export type Response = {
  status: (statusCode: number) => Response,
  send: (data: any) => void
}
import { readdirSync, statSync } from 'fs'
import { join, parse, sep } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { HTTPMethod, Request, Response, RouteDescriber, Router } from './types.js'

const allowedHttpMethods = [
  'GET',
  'POST',
  'PUT',
  'DELETE'
]

class RouteFilesHandler {
  private path: string
  private routeFolder: string
  private routeFiles: string[]

  constructor (routeFolder: string) {
    this.routeFolder = routeFolder
    this.path = join(process.cwd(), routeFolder)
    this.routeFiles = []
  }

  getRouteFiles () {
    const files = <string[]>readdirSync(this.path, { recursive: true })

    for (const file of files) {
      const status = statSync(join(this.path, file))

      if (status.isDirectory()) {
        continue
      }

      const { name } = parse(file)

      if (name == 'route') {
        this.routeFiles.push(normalizeExt(file))
      }
    }

    return this
  }

  async loadAll () {
    let loaded: RouteDescriber[] = []
  
    for (const file of this.routeFiles) {
      const absPath = join(this.path, file)
      const fileUrl = pathToFileURL(absPath).href
  
      const exported = await import(fileUrl)
      const methods = Object.keys(exported)
        .filter((m: string) => allowedHttpMethods.includes(m)) as HTTPMethod[]
      const route = fileToRoute(file)
  
      loaded = loaded.concat(methods.map((name: HTTPMethod) => ({
        route,
        method: { name, fn: exported[name] }
      })))
    }
  
    return loaded
  }
}

function normalizeExt (fileName: string) {
  return fileName.split('.')[0].concat('.js')
}

function fileToRoute (file: string) {
  return '/'
    .concat(parse(file).dir.split(sep).join('/'))
    .replace(/\[(.+)\]/g, ':$1')
}

export default async function route (routeFolder: string, config: { router: Router }) {
  if (!routeFolder) throw new Error('You must provide a route folder')
  if (!config.router) throw new Error('You must provide a router')

  try {
    const rfh = new RouteFilesHandler(routeFolder)
    const routeDescribers = await rfh.getRouteFiles().loadAll()

    routeDescribers.forEach(addRoute(config.router))
  } catch (error) {
    console.log(error)
    throw new Error('Something went wrong while routing the files')
  }
}

function addRoute (router: Router) {
  return ({ route, method }: RouteDescriber) => {
    const name = method.name.toLowerCase() as HTTPMethod
    const selected = router[name].bind(router)

    selected(route, async (req: Request, res: Response) => {
      const response = await method.fn(req)

      res.status(response.code).send(response)
    })
  }
}
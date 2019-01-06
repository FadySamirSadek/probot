import Github from '@octokit/rest'

export function addPagination (octokit: Github) {
  octokit.paginate = (...args: any) => paginate(octokit, args[0], args[1], args[2])
}

const defaultCallback = (response: Github.AnyResponse, done?: () => void) => response

//
// (Route: string, EndpointOptions?: Github.EndpointOptions, callback?: (response: Github.AnyResponse) => any): Promise<
//       Github.AnyResponse
//     >;
// (EndpointOptions: Github.EndpointOptions, callback?: (response: Github.AnyResponse) => any): Promise<Github.AnyResponse>;
async function paginate (octokit: Github, Route: string, EndpointOptions?: Github.EndpointOptions, callback?: (response: Github.AnyResponse) => any): Promise<any[]>
async function paginate (octokit: Github, EndpointOptions: Github.EndpointOptions, callback?: (response: Github.AnyResponse) => any): Promise<any[]>
// tslint:disable-next-line:unified-signatures
async function paginate (octokit: Github, responsePromise: Promise<Github.AnyResponse>, callback?: (response: Github.AnyResponse) => any): Promise<any[]>
async function paginate (octokit: Github, ...args: any[]) {
  // Until we fully deprecate the old paginate method, we need to check if the first argument is a promise
  // If it's not, we return the old function signature
  if (!args[0].then) {
    return octokit.paginate(args[0], args[1], args[2])
  }

  const responsePromise = args[0]
  const callback = args[1] || defaultCallback

  // TODO: make sure this works
  // Deprecated since 7.4.0
  // tslint:disable-next-line:no-console
  console.warn(new Error('this is deprecated'))
  let collection: any[] = []
  let getNextPage = true

  const done = () => {
    getNextPage = false
  }

  let response = await responsePromise

  collection = collection.concat(await callback(response, done))

  // eslint-disable-next-line no-unmodified-loop-condition
  while (getNextPage && octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response)
    collection = collection.concat(await callback(response, done))
  }
  return collection
}

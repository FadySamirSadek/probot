import {
  GitHubAPI,
  Headers,
  Variables
} from './'

export interface GraphQLError {
  message: string,
  locations?: Array<{ line: number, column: number }>,
  path?: Array<string | number>,
  extensions?: {
    [key: string]: any
  }
}

export class GraphQLQueryError extends Error {
  constructor (
    public errors: GraphQLError[],
    public query: string,
    public variables: Variables | undefined,
    public data: any
  ) {
    super(`Error(s) occurred executing GraphQL query:\n${JSON.stringify(errors, null, 2)}`)
    this.name = 'GraphQLQueryError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GraphQLQueryError)
    }
  }
}

export function addGraphQL (client: GitHubAPI) {
  client.query = graphql.bind(null, client)
}

async function graphql (client: GitHubAPI, query: string, variables?: Variables, headers: Headers = {}) {
  const res = await client.request('POST /graphql', {
    data: { query, variables },
    headers,
    method: 'POST',
    url: process.env.GHE_HOST ? `https://${process.env.GHE_HOST}/api/graphql` : '/graphql',
  })

  if (res.data.errors && res.data.errors.length > 0) {
    throw new GraphQLQueryError(
      res.data.errors,
      query,
      variables,
      res.data.data
    )
  }

  return res.data.data
}

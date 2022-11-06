import "server-only";
import { Pool } from "pg";
import { IDatabaseConnection, PreparedQuery } from "@pgtyped/query/lib/tag";
import _ from "lodash";

// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

const { DATABASE_URL } = process.env;
if (typeof DATABASE_URL !== "string")
  throw new Error("DATABASE_URL env var not set");

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

export const pgPool =
  global.pgPool ??
  new Pool({
    connectionString: DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") global.pgPool = pgPool;

// https://node-postgres.com/guides/project-structure
export const pgTypedClient: IDatabaseConnection = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query(query: string, bindings: any[]) {
    if (process.env.NODE_ENV === "production") {
      console.log({ query });
    } else {
      console.log({ query, bindings });
    }
    return pgPool.query(query, bindings);
  },
};

/* 
pgTyped camelCaseColumnNames config seems to be implemented on types, but not values.
PreparedQuery.run returns results that may not align with its type. 
We mutate results as needed for camelCaseColumnNames.
Note that pgTyped mapQueryResultRows also mutates.
*/

function camelCaseResultMutation(result: Record<string, unknown>) {
  for (const k of Object.keys(result)) {
    if (k.indexOf("_") >= 0) {
      result[_.camelCase(k)] = result[k];
      delete result[k];
    }
  }
}

export async function findUniqueOrThrow<TParamType, TResultType>(
  preparedQuery: PreparedQuery<TParamType, TResultType>,
  params: TParamType,
  conn: IDatabaseConnection
) {
  const results = await preparedQuery.run(params, conn);
  if (results.length === 1) {
    camelCaseResultMutation(results[0] as Record<string, unknown>);
    return results[0];
  } else if (results.length === 0) {
    throw new Error(`findUnique: empty results`);
  } else {
    throw new Error(`findUnique: >1 row in results (${results.length} rows)`);
  }
}

export async function findMany<TParamType, TResultType>(
  preparedQuery: PreparedQuery<TParamType, TResultType>,
  params: TParamType,
  conn: IDatabaseConnection
) {
  const results = await preparedQuery.run(params, conn);
  for (const result of results) {
    camelCaseResultMutation(result as Record<string, unknown>);
  }
  return results;
}

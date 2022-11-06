/** Types generated for queries found in "app/db/get_customers.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetCustomers' parameters type */
export type IGetCustomersParams = void;

/** 'GetCustomers' return type */
export interface IGetCustomersResult {
  email: string | null;
  id: string;
  lastSignInAt: Date | null;
}

/** 'GetCustomers' query type */
export interface IGetCustomersQuery {
  params: IGetCustomersParams;
  result: IGetCustomersResult;
}

const getCustomersIR: any = {"usedParamSet":{},"params":[],"statement":"select email, id, last_sign_in_at\nfrom auth.users\nwhere raw_user_meta_data @> '{\"appRole\": \"customer\"}'::jsonb\norder by email"};

/**
 * Query generated from SQL:
 * ```
 * select email, id, last_sign_in_at
 * from auth.users
 * where raw_user_meta_data @> '{"appRole": "customer"}'::jsonb
 * order by email
 * ```
 */
export const getCustomers = new PreparedQuery<IGetCustomersParams,IGetCustomersResult>(getCustomersIR);



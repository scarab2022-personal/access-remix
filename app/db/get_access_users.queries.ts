/** Types generated for queries found in "app/db/get_access_users.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetAccessUsers' parameters type */
export interface IGetAccessUsersParams {
  customerId: string | null | void;
}

/** 'GetAccessUsers' return type */
export interface IGetAccessUsersResult {
  accessUserId: number;
  activateCodeAt: Date | null;
  code: string;
  customerId: string;
  deletedAt: Date | null;
  description: string;
  expireCodeAt: Date | null;
  name: string;
}

/** 'GetAccessUsers' query type */
export interface IGetAccessUsersQuery {
  params: IGetAccessUsersParams;
  result: IGetAccessUsersResult;
}

const getAccessUsersIR: any = {"usedParamSet":{"customerId":true},"params":[{"name":"customerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":108,"b":118}]}],"statement":"-- \\set customerId '\\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\\''\nselect *\nfrom access_user\nwhere customer_id = :customerId\norder by name"};

/**
 * Query generated from SQL:
 * ```
 * -- \set customerId '\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\''
 * select *
 * from access_user
 * where customer_id = :customerId
 * order by name
 * ```
 */
export const getAccessUsers = new PreparedQuery<IGetAccessUsersParams,IGetAccessUsersResult>(getAccessUsersIR);



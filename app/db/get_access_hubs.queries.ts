/** Types generated for queries found in "db/get_access_hubs.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetAccessHubs' parameters type */
export interface IGetAccessHubsParams {
  customerId: string | null | void;
}

/** 'GetAccessHubs' return type */
export interface IGetAccessHubsResult {
  accessHubId: number;
  apiToken: string;
  customerId: string;
  description: string;
  heartbeatAt: Date | null;
  name: string;
}

/** 'GetAccessHubs' query type */
export interface IGetAccessHubsQuery {
  params: IGetAccessHubsParams;
  result: IGetAccessHubsResult;
}

const getAccessHubsIR: any = {"usedParamSet":{"customerId":true},"params":[{"name":"customerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":158,"b":168}]}],"statement":"-- \\set customerId '\\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\\''\nselect access_hub.*\nfrom access_hub\n    join auth.users on id = customer_id\nwhere customer_id = :customerId\norder by name"};

/**
 * Query generated from SQL:
 * ```
 * -- \set customerId '\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\''
 * select access_hub.*
 * from access_hub
 *     join auth.users on id = customer_id
 * where customer_id = :customerId
 * order by name
 * ```
 */
export const getAccessHubs = new PreparedQuery<IGetAccessHubsParams,IGetAccessHubsResult>(getAccessHubsIR);



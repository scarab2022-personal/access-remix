/** Types generated for queries found in "app/db/get_access_point.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetAccessPoint' parameters type */
export interface IGetAccessPointParams {
  accessHubId: number | null | void;
  accessPointId: number | null | void;
  customerId: string | null | void;
}

/** 'GetAccessPoint' return type */
export interface IGetAccessPointResult {
  accessHubId: number;
  accessPointId: number;
  name: string;
  position: number;
}

/** 'GetAccessPoint' query type */
export interface IGetAccessPointQuery {
  params: IGetAccessPointParams;
  result: IGetAccessPointResult;
}

const getAccessPointIR: any = {"usedParamSet":{"accessPointId":true,"accessHubId":true,"customerId":true},"params":[{"name":"accessPointId","required":false,"transform":{"type":"scalar"},"locs":[{"a":380,"b":393}]},{"name":"accessHubId","required":false,"transform":{"type":"scalar"},"locs":[{"a":419,"b":430}]},{"name":"customerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":454,"b":464}]}],"statement":"-- \\set accessPointId 14\n-- \\set accessHubId 4\n-- \\set customerId '\\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\\''\n-- select access_point.*\nselect access_point.access_point_id,\n    access_point.name,\n    access_point.position,\n    access_point.access_hub_id\nfrom access_point\n    join access_hub using (access_hub_id)\n    join auth.users u on u.id = customer_id\nwhere access_point_id = :accessPointId\n    and access_hub_id = :accessHubId\n    and customer_id = :customerId"};

/**
 * Query generated from SQL:
 * ```
 * -- \set accessPointId 14
 * -- \set accessHubId 4
 * -- \set customerId '\'733e54ae-c9dc-4b9a-94d0-764fbd1bd76e\''
 * -- select access_point.*
 * select access_point.access_point_id,
 *     access_point.name,
 *     access_point.position,
 *     access_point.access_hub_id
 * from access_point
 *     join access_hub using (access_hub_id)
 *     join auth.users u on u.id = customer_id
 * where access_point_id = :accessPointId
 *     and access_hub_id = :accessHubId
 *     and customer_id = :customerId
 * ```
 */
export const getAccessPoint = new PreparedQuery<IGetAccessPointParams,IGetAccessPointResult>(getAccessPointIR);



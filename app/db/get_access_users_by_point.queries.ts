/** Types generated for queries found in "db/get_access_users_by_point.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetAccessUsersByPoint' parameters type */
export interface IGetAccessUsersByPointParams {
  accessPointId: number | null | void;
}

/** 'GetAccessUsersByPoint' return type */
export interface IGetAccessUsersByPointResult {
  accessUserId: number;
  activateCodeAt: Date | null;
  code: string;
  customerId: string;
  deletedAt: Date | null;
  description: string;
  expireCodeAt: Date | null;
  name: string;
}

/** 'GetAccessUsersByPoint' query type */
export interface IGetAccessUsersByPointQuery {
  params: IGetAccessUsersByPointParams;
  result: IGetAccessUsersByPointResult;
}

const getAccessUsersByPointIR: any = {"usedParamSet":{"accessPointId":true},"params":[{"name":"accessPointId","required":false,"transform":{"type":"scalar"},"locs":[{"a":147,"b":160}]}],"statement":"-- \\set accessPointId 14\nselect access_user.*\nfrom access_user\n    join access_point_to_access_user using (access_user_id)\nwhere access_point_id = :accessPointId\norder by name"};

/**
 * Query generated from SQL:
 * ```
 * -- \set accessPointId 14
 * select access_user.*
 * from access_user
 *     join access_point_to_access_user using (access_user_id)
 * where access_point_id = :accessPointId
 * order by name
 * ```
 */
export const getAccessUsersByPoint = new PreparedQuery<IGetAccessUsersByPointParams,IGetAccessUsersByPointResult>(getAccessUsersByPointIR);



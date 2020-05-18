import { RequestType } from '../enums/request-type.enum';

export interface IStorageRequest {
  readonly type: RequestType;
  readonly key?: string;
  readonly value?: string | object;
}

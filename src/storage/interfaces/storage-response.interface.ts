import { RequestType } from '../enums/request-type.enum';

export interface IStorageResponse {
  readonly type: RequestType;
  readonly key: string;
  value: string | object;
  error?: string;
}

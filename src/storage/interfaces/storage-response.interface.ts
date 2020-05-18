import { RequestType } from '../enums/request-type.enum';

export interface IStorageResponse {
  readonly type: RequestType;
  readonly key: string;
  readonly value: string | object;
  readonly error?: string;
}

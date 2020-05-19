import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IsStringOrObject } from '../../validation/decorators/is-string-or-object.validator';
import { RequestType } from '../enums/request-type.enum';

export class StorageRequestDto {
  @IsEnum(RequestType)
  readonly type: RequestType;

  @IsString()
  readonly key: string;

  @IsOptional()
  @IsStringOrObject('value', { message: 'value could be a string or object' })
  readonly value?: string | object;
}

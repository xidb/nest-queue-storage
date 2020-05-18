import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStringOrObject(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function(object: object, propertyName: string): void {
    registerDecorator({
      name: 'IsStringOrObject',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string | object): boolean {
          return (
            typeof value === 'string' ||
            (typeof value === 'object' &&
              value !== null &&
              !Array.isArray(value))
          );
        },
      },
    });
  };
}

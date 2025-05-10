import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function Requires(fields: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'requires',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: fields,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const requiredFields = args.constraints;

          const missingFields = requiredFields.filter((field) => obj[field] === undefined);

          return missingFields.length === 0;
        },
        defaultMessage(args: ValidationArguments) {
          const requiredFields = args.constraints.join(', ');
          return `${args.property} requires the following fields to be present: ${requiredFields}`;
        },
      },
    });
  };
}
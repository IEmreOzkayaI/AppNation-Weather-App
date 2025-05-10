import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function CannotBeUsedWith(fields: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'cannotBeUsedWith',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: fields,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const conflictingFields = args.constraints.filter((field) => obj[field] !== undefined);

          return conflictingFields.length === 0 || value === undefined;
        },
        defaultMessage(args: ValidationArguments) {
          const conflictingFields = args.constraints.join(', ');
          return `This field cannot be used together with the following fields: ${conflictingFields}`;
        },
      },
    });
  };
}

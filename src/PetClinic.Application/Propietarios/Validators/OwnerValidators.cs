using FluentValidation;
using PetClinic.Application.Propietarios.Commands;

namespace PetClinic.Application.Propietarios.Validators;

public class CreateOwnerCommandValidator : AbstractValidator<CreateOwnerCommand>
{
    public CreateOwnerCommandValidator()
    {
        RuleFor(v => v.NombreCompleto)
            .NotEmpty().WithMessage("El nombre completo es obligatorio.")
            .MinimumLength(3).WithMessage("El nombre completo debe tener al menos 3 caracteres.")
            .MaximumLength(150).WithMessage("El nombre completo no debe superar los 150 caracteres.");

        RuleFor(v => v.Telefono)
            .NotEmpty().WithMessage("El número telefónico es obligatorio.")
            .MaximumLength(20).WithMessage("El teléfono no debe superar los 20 caracteres.")
            .Matches(@"^[0-9+\-\s()]+$").WithMessage("El formato del teléfono no es válido (solo números y caracteres telefónicos estándar).");

        RuleFor(v => v.CorreoElectronico)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El formato del correo electrónico no es válido.")
            .MaximumLength(100).WithMessage("El correo electrónico no debe superar los 100 caracteres.");

        RuleFor(v => v.Direccion)
            .MaximumLength(200).WithMessage("La dirección no debe superar los 200 caracteres.");
    }
}

public class UpdateOwnerCommandValidator : AbstractValidator<UpdateOwnerCommand>
{
    public UpdateOwnerCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("El identificador es obligatorio.");

        RuleFor(v => v.NombreCompleto)
            .NotEmpty().WithMessage("El nombre completo es obligatorio.")
            .MinimumLength(3).WithMessage("El nombre completo debe tener al menos 3 caracteres.")
            .MaximumLength(150).WithMessage("El nombre completo no debe superar los 150 caracteres.");

        RuleFor(v => v.Telefono)
            .NotEmpty().WithMessage("El número telefónico es obligatorio.")
            .MaximumLength(20).WithMessage("El teléfono no debe superar los 20 caracteres.")
            .Matches(@"^[0-9+\-\s()]+$").WithMessage("El formato del teléfono no es válido.");

        RuleFor(v => v.CorreoElectronico)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El formato del correo electrónico no es válido.")
            .MaximumLength(100).WithMessage("El correo electrónico no debe superar los 100 caracteres.");

        RuleFor(v => v.Direccion)
            .MaximumLength(200).WithMessage("La dirección no debe superar los 200 caracteres.");
    }
}

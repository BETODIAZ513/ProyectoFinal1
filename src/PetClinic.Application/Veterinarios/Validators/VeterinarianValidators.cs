using FluentValidation;
using PetClinic.Application.Veterinarios.Commands;

namespace PetClinic.Application.Veterinarios.Validators;

public class CreateVeterinarianCommandValidator : AbstractValidator<CreateVeterinarianCommand>
{
    public CreateVeterinarianCommandValidator()
    {
        RuleFor(v => v.NombreCompleto)
            .NotEmpty().WithMessage("El nombre completo es obligatorio.")
            .MinimumLength(3).WithMessage("El nombre completo debe tener al menos 3 caracteres.")
            .MaximumLength(150).WithMessage("El nombre completo no debe superar los 150 caracteres.");

        RuleFor(v => v.Especialidad)
            .NotEmpty().WithMessage("La especialidad es obligatoria.")
            .MaximumLength(100).WithMessage("La especialidad no debe superar los 100 caracteres.");

        RuleFor(v => v.NumeroColegiatura)
            .NotEmpty().WithMessage("El número de colegiatura es obligatorio.")
            .MaximumLength(30).WithMessage("El número de colegiatura no debe superar los 30 caracteres.");

        RuleFor(v => v.Telefono)
            .NotEmpty().WithMessage("El número telefónico es obligatorio.")
            .MaximumLength(20).WithMessage("El teléfono no debe superar los 20 caracteres.")
            .Matches(@"^[0-9+\-\s()]+$").WithMessage("El formato del teléfono no es válido.");

        RuleFor(v => v.CorreoElectronico)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El formato del correo electrónico no es válido.")
            .MaximumLength(100).WithMessage("El correo electrónico no debe superar los 100 caracteres.");

        RuleFor(v => v.Password)
            .NotEmpty().WithMessage("La contraseña de acceso es obligatoria.")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres.");
    }
}

public class UpdateVeterinarianCommandValidator : AbstractValidator<UpdateVeterinarianCommand>
{
    public UpdateVeterinarianCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("El identificador es obligatorio.");

        RuleFor(v => v.NombreCompleto)
            .NotEmpty().WithMessage("El nombre completo es obligatorio.")
            .MinimumLength(3).WithMessage("El nombre completo debe tener al menos 3 caracteres.")
            .MaximumLength(150).WithMessage("El nombre completo no debe superar los 150 caracteres.");

        RuleFor(v => v.Especialidad)
            .NotEmpty().WithMessage("La especialidad es obligatoria.")
            .MaximumLength(100).WithMessage("La especialidad no debe superar los 100 caracteres.");

        RuleFor(v => v.NumeroColegiatura)
            .NotEmpty().WithMessage("El número de colegiatura es obligatorio.")
            .MaximumLength(30).WithMessage("El número de colegiatura no debe superar los 30 caracteres.");

        RuleFor(v => v.Telefono)
            .NotEmpty().WithMessage("El número telefónico es obligatorio.")
            .MaximumLength(20).WithMessage("El teléfono no debe superar los 20 caracteres.")
            .Matches(@"^[0-9+\-\s()]+$").WithMessage("El formato del teléfono no es válido.");

        RuleFor(v => v.CorreoElectronico)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El formato del correo electrónico no es válido.")
            .MaximumLength(100).WithMessage("El correo electrónico no debe superar los 100 caracteres.");
    }
}

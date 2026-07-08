using FluentValidation;
using PetClinic.Application.Mascotas.Commands;
using System;

namespace PetClinic.Application.Mascotas.Validators;

public class CreatePetCommandValidator : AbstractValidator<CreatePetCommand>
{
    public CreatePetCommandValidator()
    {
        RuleFor(v => v.Nombre)
            .NotEmpty().WithMessage("El nombre de la mascota es obligatorio.")
            .MinimumLength(2).WithMessage("El nombre debe tener al menos 2 caracteres.")
            .MaximumLength(100).WithMessage("El nombre no debe superar los 100 caracteres.");

        RuleFor(v => v.Especie)
            .NotEmpty().WithMessage("La especie es obligatoria.")
            .MaximumLength(50).WithMessage("La especie no debe superar los 50 caracteres.");

        RuleFor(v => v.Raza)
            .NotEmpty().WithMessage("La raza es obligatoria.")
            .MaximumLength(50).WithMessage("La raza no debe superar los 50 caracteres.");

        RuleFor(v => v.Sexo)
            .NotEmpty().WithMessage("El sexo es obligatorio.")
            .MaximumLength(15).WithMessage("El sexo no debe superar los 15 caracteres.");

        RuleFor(v => v.Color)
            .MaximumLength(50).WithMessage("El color no debe superar los 50 caracteres.");

        RuleFor(v => v.PropietarioId)
            .NotEmpty().WithMessage("El identificador del propietario es obligatorio.");

        RuleFor(v => v.FechaNacimiento)
            .LessThanOrEqualTo(DateTime.Today).WithMessage("La fecha de nacimiento no puede ser una fecha futura.");
    }
}

public class UpdatePetCommandValidator : AbstractValidator<UpdatePetCommand>
{
    public UpdatePetCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("El identificador de la mascota es obligatorio.");

        RuleFor(v => v.Nombre)
            .NotEmpty().WithMessage("El nombre de la mascota es obligatorio.")
            .MinimumLength(2).WithMessage("El nombre debe tener al menos 2 caracteres.")
            .MaximumLength(100).WithMessage("El nombre no debe superar los 100 caracteres.");

        RuleFor(v => v.Especie)
            .NotEmpty().WithMessage("La especie es obligatoria.")
            .MaximumLength(50).WithMessage("La especie no debe superar los 50 caracteres.");

        RuleFor(v => v.Raza)
            .NotEmpty().WithMessage("La raza es obligatoria.")
            .MaximumLength(50).WithMessage("La raza no debe superar los 50 caracteres.");

        RuleFor(v => v.Sexo)
            .NotEmpty().WithMessage("El sexo es obligatorio.")
            .MaximumLength(15).WithMessage("El sexo no debe superar los 15 caracteres.");

        RuleFor(v => v.Color)
            .MaximumLength(50).WithMessage("El color no debe superar los 50 caracteres.");

        RuleFor(v => v.PropietarioId)
            .NotEmpty().WithMessage("El identificador del propietario es obligatorio.");

        RuleFor(v => v.FechaNacimiento)
            .LessThanOrEqualTo(DateTime.Today).WithMessage("La fecha de nacimiento no puede ser futura.");
    }
}

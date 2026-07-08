using FluentValidation;
using PetClinic.Application.Mascotas.Commands;
using System;

namespace PetClinic.Application.Mascotas.Validators;

public class CreateWeightRecordCommandValidator : AbstractValidator<CreateWeightRecordCommand>
{
    public CreateWeightRecordCommandValidator()
    {
        RuleFor(v => v.PesoKg)
            .GreaterThan(0).WithMessage("El peso registrado debe ser mayor que cero kg.");

        RuleFor(v => v.FechaRegistro)
            .LessThanOrEqualTo(DateTime.Today).WithMessage("La fecha del registro de peso no puede ser una fecha futura.");

        RuleFor(v => v.MascotaId)
            .NotEmpty().WithMessage("El identificador de la mascota es obligatorio.");
    }
}

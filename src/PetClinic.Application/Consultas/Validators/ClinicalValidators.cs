using FluentValidation;
using PetClinic.Application.Consultas.Commands;

namespace PetClinic.Application.Consultas.Validators;

public class CreateConsultationDetailCommandValidator : AbstractValidator<CreateConsultationDetailCommand>
{
    public CreateConsultationDetailCommandValidator()
    {
        RuleFor(v => v.CitaId)
            .NotEmpty().WithMessage("El identificador de la cita es obligatorio.");

        RuleFor(v => v.MascotaId)
            .NotEmpty().WithMessage("El identificador de la mascota es obligatorio.");

        RuleFor(v => v.VeterinarioId)
            .NotEmpty().WithMessage("El identificador del veterinario es obligatorio.");

        RuleFor(v => v.Diagnostico)
            .NotEmpty().WithMessage("El diagnóstico médico es obligatorio.")
            .MaximumLength(500).WithMessage("El diagnóstico no debe superar los 500 caracteres.");

        RuleFor(v => v.Tratamiento)
            .NotEmpty().WithMessage("El tratamiento médico es obligatorio.")
            .MaximumLength(500).WithMessage("El tratamiento no debe superar los 500 caracteres.");

        RuleFor(v => v.NotasAdicionales)
            .MaximumLength(1000).WithMessage("Las notas adicionales no deben superar los 1000 caracteres.");
    }
}

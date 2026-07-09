using FluentValidation;
using PetClinic.Application.Tareas.Commands;

namespace PetClinic.Application.Tareas.Validators;

public class CreateClinicalTaskCommandValidator : AbstractValidator<CreateClinicalTaskCommand>
{
    public CreateClinicalTaskCommandValidator()
    {
        RuleFor(v => v.Titulo)
            .NotEmpty().WithMessage("El título de la tarea es obligatorio.")
            .MaximumLength(150).WithMessage("El título no debe superar los 150 caracteres.");

        RuleFor(v => v.MascotaId)
            .NotEmpty().WithMessage("El identificador del paciente (mascota) es obligatorio.");

        RuleFor(v => v.VeterinarioApplicationUserId)
            .NotEmpty().WithMessage("El usuario del veterinario creador es obligatorio.");

        RuleFor(v => v.Descripcion)
            .MaximumLength(500).WithMessage("La descripción de la tarea no debe superar los 500 caracteres.");
    }
}

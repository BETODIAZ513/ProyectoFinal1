using FluentValidation;
using PetClinic.Application.Citas.Commands;
using System;

namespace PetClinic.Application.Citas.Validators;

public class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
{
    public CreateAppointmentCommandValidator()
    {
        RuleFor(v => v.MascotaId)
            .NotEmpty().WithMessage("El identificador de la mascota es obligatorio.");

        RuleFor(v => v.VeterinarioId)
            .NotEmpty().WithMessage("El identificador del veterinario es obligatorio.");

        RuleFor(v => v.Motivo)
            .NotEmpty().WithMessage("El motivo de la cita es obligatorio.")
            .MaximumLength(250).WithMessage("El motivo de la cita no debe superar los 250 caracteres.");

        RuleFor(v => v.FechaHora)
            .Must(BeAFutureDate).WithMessage("La fecha y hora de la cita debe estar en el futuro.");
    }

    private bool BeAFutureDate(DateTime dateTime)
    {
        // Tolerar un margen de 2 minutos por desincronizaciones leves de reloj en peticiones inmediatas
        return dateTime >= DateTime.Now.AddMinutes(-2);
    }
}

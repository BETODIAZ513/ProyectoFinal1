using FluentValidation;
using PetClinic.Application.Hospitalizaciones.Commands;

namespace PetClinic.Application.Hospitalizaciones.Validators;

public class AdmitPatientCommandValidator : AbstractValidator<AdmitPatientCommand>
{
    public AdmitPatientCommandValidator()
    {
        RuleFor(v => v.MascotaId)
            .NotEmpty().WithMessage("El identificador de la mascota es obligatorio.");

        RuleFor(v => v.Motivo)
            .NotEmpty().WithMessage("El motivo del internamiento es obligatorio.")
            .MaximumLength(500).WithMessage("El motivo no debe superar los 500 caracteres.");

        RuleFor(v => v.NumeroJaula)
            .NotEmpty().WithMessage("El número de jaula es obligatorio.")
            .MaximumLength(30).WithMessage("El código de jaula no debe superar los 30 caracteres.");
    }
}

public class CreateMonitoringRecordCommandValidator : AbstractValidator<CreateMonitoringRecordCommand>
{
    public CreateMonitoringRecordCommandValidator()
    {
        RuleFor(v => v.HospitalizacionId)
            .NotEmpty().WithMessage("El identificador de hospitalización es obligatorio.");

        RuleFor(v => v.Temperatura)
            .ExclusiveBetween(30.0m, 45.0m).WithMessage("La temperatura debe estar en un rango biológico aceptable (30.0 °C a 45.0 °C).");

        RuleFor(v => v.FrecuenciaCardiaca)
            .GreaterThan(0).WithMessage("La frecuencia cardíaca debe ser mayor a 0 lpm.")
            .LessThan(400).WithMessage("La frecuencia cardíaca no puede exceder los 400 lpm.");

        RuleFor(v => v.FrecuenciaRespiratoria)
            .GreaterThan(0).WithMessage("La frecuencia respiratoria debe ser mayor a 0 rpm.")
            .LessThan(200).WithMessage("La frecuencia respiratoria no puede exceder los 200 rpm.");

        RuleFor(v => v.EstadoAlerta)
            .NotEmpty().WithMessage("El estado de alerta es obligatorio.")
            .MaximumLength(50).WithMessage("El estado de alerta no debe superar los 50 caracteres.");
    }
}

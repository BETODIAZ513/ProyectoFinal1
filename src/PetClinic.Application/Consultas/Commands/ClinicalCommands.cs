using MediatR;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Consultas.Commands;

public record CreateConsultationDetailCommand(
    int CitaId, 
    int MascotaId, 
    int VeterinarioId, 
    string Diagnostico, 
    string Tratamiento, 
    string NotasAdicionales) : IRequest<int>;

public class CreateConsultationDetailCommandHandler : IRequestHandler<CreateConsultationDetailCommand, int>
{
    private readonly IPetClinicDbContext _context;

    public CreateConsultationDetailCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateConsultationDetailCommand request, CancellationToken cancellationToken)
    {
        var cita = await _context.Citas.FindAsync(new object[] { request.CitaId }, cancellationToken);
        if (cita == null)
        {
            throw new Exception("La cita especificada no existe.");
        }
        if (cita.Estado == "Completada" || cita.Estado == "Cancelada")
        {
            throw new Exception($"No se puede registrar detalles clínicos para una cita que ya se encuentra {cita.Estado}.");
        }

        var detalle = new DetalleConsulta
        {
            CitaId = request.CitaId,
            MascotaId = request.MascotaId,
            VeterinarioId = request.VeterinarioId,
            FechaAtencion = DateTime.UtcNow,
            Diagnostico = request.Diagnostico,
            Tratamiento = request.Tratamiento,
            NotasAdicionales = request.NotasAdicionales ?? string.Empty
        };

        _context.DetallesConsultas.Add(detalle);

        // Actualizar estado de cita de manera atómica
        cita.Estado = "Completada";

        await _context.SaveChangesAsync(cancellationToken);

        return detalle.Id;
    }
}

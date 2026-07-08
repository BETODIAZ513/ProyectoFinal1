using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Citas.Commands;

public record CreateAppointmentCommand(
    int MascotaId, 
    int VeterinarioId, 
    DateTime FechaHora, 
    string Motivo) : IRequest<int>;

public class CreateAppointmentCommandHandler : IRequestHandler<CreateAppointmentCommand, int>
{
    private readonly IPetClinicDbContext _context;

    public CreateAppointmentCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
    {
        var pet = await _context.Mascotas.FindAsync(new object[] { request.MascotaId }, cancellationToken);
        if (pet == null || !pet.Activo)
        {
            throw new Exception("La mascota especificada no existe o se encuentra inactiva.");
        }

        var vet = await _context.Veterinarios.FindAsync(new object[] { request.VeterinarioId }, cancellationToken);
        if (vet == null || !vet.Activo)
        {
            throw new Exception("El veterinario especificado no existe o se encuentra inactivo.");
        }

        // Validación de superposición (Overlapping de 30 minutos)
        var proposedStart = request.FechaHora;
        var proposedEnd = proposedStart.AddMinutes(30);

        var isOverlapping = await _context.Citas.AnyAsync(c => 
            c.VeterinarioId == request.VeterinarioId && 
            c.Estado != "Cancelada" &&
            ((proposedStart >= c.FechaHora && proposedStart < c.FechaHora.AddMinutes(30)) ||
             (proposedEnd > c.FechaHora && proposedEnd <= c.FechaHora.AddMinutes(30))), 
            cancellationToken);

        if (isOverlapping)
        {
            throw new Exception("El veterinario seleccionado ya posee una cita agendada en ese rango horario.");
        }

        var cita = new Cita
        {
            MascotaId = request.MascotaId,
            VeterinarioId = request.VeterinarioId,
            FechaHora = request.FechaHora,
            Motivo = request.Motivo,
            Estado = "Agendada"
        };

        _context.Citas.Add(cita);
        await _context.SaveChangesAsync(cancellationToken);

        return cita.Id;
    }
}

public record UpdateAppointmentStatusCommand(int Id, string Estado) : IRequest<bool>;

public class UpdateAppointmentStatusCommandHandler : IRequestHandler<UpdateAppointmentStatusCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public UpdateAppointmentStatusCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateAppointmentStatusCommand request, CancellationToken cancellationToken)
    {
        var cita = await _context.Citas.FindAsync(new object[] { request.Id }, cancellationToken);
        if (cita == null)
        {
            return false;
        }

        if (cita.Estado == "Cancelada" || cita.Estado == "Completada")
        {
            throw new Exception($"No se puede cambiar el estado de una cita que ya se encuentra {cita.Estado}.");
        }

        var nuevoEstado = request.Estado;
        if (nuevoEstado != "Agendada" && nuevoEstado != "Completada" && nuevoEstado != "Cancelada" && nuevoEstado != "En Espera")
        {
            throw new Exception("Estado de cita no válido.");
        }

        cita.Estado = nuevoEstado;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

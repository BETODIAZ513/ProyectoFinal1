using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Tareas.Commands;

public record CreateClinicalTaskCommand(
    string Titulo, 
    string Descripcion, 
    int MascotaId, 
    string VeterinarioApplicationUserId, 
    int? CitaId) : IRequest<int>;

public class CreateClinicalTaskCommandHandler : IRequestHandler<CreateClinicalTaskCommand, int>
{
    private readonly IPetClinicDbContext _context;

    public CreateClinicalTaskCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateClinicalTaskCommand request, CancellationToken cancellationToken)
    {
        // 1. Validar Mascota
        var pet = await _context.Mascotas.FindAsync(new object[] { request.MascotaId }, cancellationToken);
        if (pet == null || !pet.Activo)
        {
            throw new Exception("La mascota especificada no existe o se encuentra inactiva.");
        }

        // 2. Buscar VeterinarioId a partir del ApplicationUserId
        var vet = await _context.Veterinarios
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.ApplicationUserId == request.VeterinarioApplicationUserId, cancellationToken);

        if (vet == null)
        {
            throw new Exception("El veterinario creador de la tarea no existe en los perfiles clínicos.");
        }

        var tarea = new TareaClinica
        {
            Titulo = request.Titulo,
            Descripcion = request.Descripcion ?? string.Empty,
            MascotaId = request.MascotaId,
            VeterinarioId = vet.Id,
            CitaId = request.CitaId,
            Estado = "Pendiente"
        };

        _context.TareasClinicas.Add(tarea);
        await _context.SaveChangesAsync(cancellationToken);

        return tarea.Id;
    }
}

public record UpdateClinicalTaskStatusCommand(int Id, string Estado) : IRequest<bool>;

public class UpdateClinicalTaskStatusCommandHandler : IRequestHandler<UpdateClinicalTaskStatusCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public UpdateClinicalTaskStatusCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateClinicalTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var tarea = await _context.TareasClinicas.FindAsync(new object[] { request.Id }, cancellationToken);
        if (tarea == null)
        {
            return false;
        }

        var nuevoEstado = request.Estado;
        if (nuevoEstado != "Pendiente" && nuevoEstado != "En Progreso" && nuevoEstado != "Completada")
        {
            throw new Exception("Estado de tarea clínica no válido.");
        }

        tarea.Estado = nuevoEstado;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

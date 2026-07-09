using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Tareas.Models;
using PetClinic.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Tareas.Queries;

public record GetClinicalTasksQuery : IRequest<IEnumerable<TareaClinicaDto>>;

public class GetClinicalTasksQueryHandler : IRequestHandler<GetClinicalTasksQuery, IEnumerable<TareaClinicaDto>>
{
    private readonly IPetClinicDbContext _context;

    public GetClinicalTasksQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TareaClinicaDto>> Handle(GetClinicalTasksQuery request, CancellationToken cancellationToken)
    {
        var query = from t in _context.TareasClinicas.AsNoTracking()
                    join m in _context.Mascotas.AsNoTracking() on t.MascotaId equals m.Id
                    join v in _context.Veterinarios.AsNoTracking() on t.VeterinarioId equals v.Id
                    select new TareaClinicaDto
                    {
                        Id = t.Id,
                        Titulo = t.Titulo,
                        Descripcion = t.Descripcion,
                        Estado = t.Estado,
                        MascotaId = t.MascotaId,
                        MascotaNombre = m.Nombre,
                        VeterinarioId = t.VeterinarioId,
                        VeterinarioNombre = v.NombreCompleto,
                        CitaId = t.CitaId
                    };

        return await query.ToListAsync(cancellationToken);
    }
}

public record GetPredefinedTasksQuery : IRequest<IEnumerable<TareaPredefinida>>;

public class GetPredefinedTasksQueryHandler : IRequestHandler<GetPredefinedTasksQuery, IEnumerable<TareaPredefinida>>
{
    private readonly IPetClinicDbContext _context;

    public GetPredefinedTasksQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TareaPredefinida>> Handle(GetPredefinedTasksQuery request, CancellationToken cancellationToken)
    {
        return await _context.TareasPredefinidas
            .AsNoTracking()
            .OrderBy(t => t.Nombre)
            .ToListAsync(cancellationToken);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Citas.Models;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Common.Models;
using PetClinic.Application.Consultas.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Consultas.Queries;

public record GetClinicalHistoryQuery(int MascotaId) : IRequest<IEnumerable<DetalleConsultaDto>>;

public class GetClinicalHistoryQueryHandler : IRequestHandler<GetClinicalHistoryQuery, IEnumerable<DetalleConsultaDto>>
{
    private readonly IPetClinicDbContext _context;

    public GetClinicalHistoryQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DetalleConsultaDto>> Handle(GetClinicalHistoryQuery request, CancellationToken cancellationToken)
    {
        var query = from d in _context.DetallesConsultas.AsNoTracking()
                    join v in _context.Veterinarios.AsNoTracking() on d.VeterinarioId equals v.Id
                    where d.MascotaId == request.MascotaId
                    select new DetalleConsultaDto
                    {
                        Id = d.Id,
                        CitaId = d.CitaId,
                        MascotaId = d.MascotaId,
                        VeterinarioId = d.VeterinarioId,
                        VeterinarioNombreCompleto = v.NombreCompleto,
                        FechaAtencion = d.FechaAtencion,
                        Diagnostico = d.Diagnostico,
                        Tratamiento = d.Tratamiento,
                        NotasAdicionales = d.NotasAdicionales
                    };

        return await query.OrderByDescending(dto => dto.FechaAtencion).ToListAsync(cancellationToken);
    }
}

public record GetAppointmentsHistoryQuery(int Page = 1, int PageSize = 10) : IRequest<PagedList<CitaDto>>;

public class GetAppointmentsHistoryQueryHandler : IRequestHandler<GetAppointmentsHistoryQuery, PagedList<CitaDto>>
{
    private readonly IPetClinicDbContext _context;

    public GetAppointmentsHistoryQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<PagedList<CitaDto>> Handle(GetAppointmentsHistoryQuery request, CancellationToken cancellationToken)
    {
        var query = from c in _context.Citas.AsNoTracking()
                    join m in _context.Mascotas.AsNoTracking() on c.MascotaId equals m.Id
                    join o in _context.Propietarios.AsNoTracking() on m.PropietarioId equals o.Id
                    join v in _context.Veterinarios.AsNoTracking() on c.VeterinarioId equals v.Id
                    where c.Estado == "Completada" || c.Estado == "Cancelada"
                    select new CitaDto
                    {
                        Id = c.Id,
                        MascotaId = c.MascotaId,
                        MascotaNombre = m.Nombre,
                        VeterinarioId = c.VeterinarioId,
                        VeterinarioNombreCompleto = v.NombreCompleto,
                        PropietarioNombreCompleto = o.NombreCompleto,
                        FechaHora = c.FechaHora,
                        Motivo = c.Motivo,
                        Estado = c.Estado
                    };

        query = query.OrderByDescending(dto => dto.FechaHora);

        var count = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedList<CitaDto>(items, count, request.Page, request.PageSize);
    }
}

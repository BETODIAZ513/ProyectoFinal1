using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Citas.Models;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Citas.Queries;

public record GetAppointmentsPagedQuery(int Page = 1, int PageSize = 10) : IRequest<PagedList<CitaDto>>;

public class GetAppointmentsPagedQueryHandler : IRequestHandler<GetAppointmentsPagedQuery, PagedList<CitaDto>>
{
    private readonly IPetClinicDbContext _context;

    public GetAppointmentsPagedQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<PagedList<CitaDto>> Handle(GetAppointmentsPagedQuery request, CancellationToken cancellationToken)
    {
        var query = from c in _context.Citas.AsNoTracking()
                    join m in _context.Mascotas.AsNoTracking() on c.MascotaId equals m.Id
                    join o in _context.Propietarios.AsNoTracking() on m.PropietarioId equals o.Id
                    join v in _context.Veterinarios.AsNoTracking() on c.VeterinarioId equals v.Id
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

public record GetTodayAppointmentsQuery : IRequest<IEnumerable<CitaDto>>;

public class GetTodayAppointmentsQueryHandler : IRequestHandler<GetTodayAppointmentsQuery, IEnumerable<CitaDto>>
{
    private readonly IPetClinicDbContext _context;

    public GetTodayAppointmentsQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CitaDto>> Handle(GetTodayAppointmentsQuery request, CancellationToken cancellationToken)
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        var query = from c in _context.Citas.AsNoTracking()
                    join m in _context.Mascotas.AsNoTracking() on c.MascotaId equals m.Id
                    join o in _context.Propietarios.AsNoTracking() on m.PropietarioId equals o.Id
                    join v in _context.Veterinarios.AsNoTracking() on c.VeterinarioId equals v.Id
                    where c.FechaHora >= today && c.FechaHora < tomorrow
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

        return await query.OrderBy(dto => dto.FechaHora).ToListAsync(cancellationToken);
    }
}

public record GetAppointmentsByVeterinarianQuery(string ApplicationUserId) : IRequest<IEnumerable<CitaDto>>;

public class GetAppointmentsByVeterinarianQueryHandler : IRequestHandler<GetAppointmentsByVeterinarianQuery, IEnumerable<CitaDto>>
{
    private readonly IPetClinicDbContext _context;

    public GetAppointmentsByVeterinarianQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CitaDto>> Handle(GetAppointmentsByVeterinarianQuery request, CancellationToken cancellationToken)
    {
        // 1. Encontrar el VeterinarioId correspondiente al usuario logueado
        var vet = await _context.Veterinarios
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.ApplicationUserId == request.ApplicationUserId, cancellationToken);

        if (vet == null)
        {
            return new List<CitaDto>();
        }

        // 2. Traer todas las citas de hoy en adelante para ese veterinario
        var today = DateTime.Today;

        var query = from c in _context.Citas.AsNoTracking()
                    join m in _context.Mascotas.AsNoTracking() on c.MascotaId equals m.Id
                    join o in _context.Propietarios.AsNoTracking() on m.PropietarioId equals o.Id
                    where c.VeterinarioId == vet.Id && c.FechaHora >= today
                    select new CitaDto
                    {
                        Id = c.Id,
                        MascotaId = c.MascotaId,
                        MascotaNombre = m.Nombre,
                        VeterinarioId = c.VeterinarioId,
                        VeterinarioNombreCompleto = vet.NombreCompleto,
                        PropietarioNombreCompleto = o.NombreCompleto,
                        FechaHora = c.FechaHora,
                        Motivo = c.Motivo,
                        Estado = c.Estado
                    };

        return await query.OrderBy(dto => dto.FechaHora).ToListAsync(cancellationToken);
    }
}

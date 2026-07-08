using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Common.Models;
using PetClinic.Application.Mascotas.Models;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Mascotas.Queries;

public record GetPetByIdQuery(int Id) : IRequest<MascotaDto?>;

public class GetPetByIdQueryHandler : IRequestHandler<GetPetByIdQuery, MascotaDto?>
{
    private readonly IPetClinicDbContext _context;

    public GetPetByIdQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<MascotaDto?> Handle(GetPetByIdQuery request, CancellationToken cancellationToken)
    {
        var mascota = await _context.Mascotas.FindAsync(new object[] { request.Id }, cancellationToken);
        if (mascota == null) return null;

        var owner = await _context.Propietarios.FindAsync(new object[] { mascota.PropietarioId }, cancellationToken);

        return new MascotaDto
        {
            Id = mascota.Id,
            Nombre = mascota.Nombre,
            Especie = mascota.Especie,
            Raza = mascota.Raza,
            FechaNacimiento = mascota.FechaNacimiento,
            Sexo = mascota.Sexo,
            Color = mascota.Color,
            PropietarioId = mascota.PropietarioId,
            PropietarioNombreCompleto = owner?.NombreCompleto ?? "Desconocido",
            Activo = mascota.Activo
        };
    }
}

public record GetPetsPagedQuery(string? SearchTerm, int Page = 1, int PageSize = 10) : IRequest<PagedList<MascotaDto>>;

public class GetPetsPagedQueryHandler : IRequestHandler<GetPetsPagedQuery, PagedList<MascotaDto>>
{
    private readonly IPetClinicDbContext _context;

    public GetPetsPagedQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<PagedList<MascotaDto>> Handle(GetPetsPagedQuery request, CancellationToken cancellationToken)
    {
        var query = from m in _context.Mascotas.AsNoTracking()
                    join o in _context.Propietarios.AsNoTracking() on m.PropietarioId equals o.Id
                    select new MascotaDto
                    {
                        Id = m.Id,
                        Nombre = m.Nombre,
                        Especie = m.Especie,
                        Raza = m.Raza,
                        FechaNacimiento = m.FechaNacimiento,
                        Sexo = m.Sexo,
                        Color = m.Color,
                        PropietarioId = m.PropietarioId,
                        PropietarioNombreCompleto = o.NombreCompleto,
                        Activo = m.Activo
                    };

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(dto => 
                dto.Nombre.ToLower().Contains(term) || 
                dto.Especie.ToLower().Contains(term) || 
                dto.PropietarioNombreCompleto.ToLower().Contains(term)
            );
        }

        query = query.OrderBy(dto => dto.Nombre);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedList<MascotaDto>(items, totalCount, request.Page, request.PageSize);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Common.Models;
using PetClinic.Domain.Entities;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Propietarios.Queries;

public record GetOwnerByIdQuery(int Id) : IRequest<Propietario?>;

public class GetOwnerByIdQueryHandler : IRequestHandler<GetOwnerByIdQuery, Propietario?>
{
    private readonly IPetClinicDbContext _context;

    public GetOwnerByIdQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<Propietario?> Handle(GetOwnerByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Propietarios.FindAsync(new object[] { request.Id }, cancellationToken);
    }
}

public record GetOwnersPagedQuery(string? SearchTerm, int Page = 1, int PageSize = 10) : IRequest<PagedList<Propietario>>;

public class GetOwnersPagedQueryHandler : IRequestHandler<GetOwnersPagedQuery, PagedList<Propietario>>
{
    private readonly IPetClinicDbContext _context;

    public GetOwnersPagedQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<PagedList<Propietario>> Handle(GetOwnersPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Propietarios.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(p => 
                p.NombreCompleto.ToLower().Contains(term) || 
                p.Telefono.Contains(term) || 
                p.CorreoElectronico.ToLower().Contains(term)
            );
        }

        // Ordenamiento por defecto
        query = query.OrderBy(p => p.NombreCompleto);

        var totalCount = await query.CountAsync(cancellationToken);
        
        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedList<Propietario>(items, totalCount, request.Page, request.PageSize);
    }
}

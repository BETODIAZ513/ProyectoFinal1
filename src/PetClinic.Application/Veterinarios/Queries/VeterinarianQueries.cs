using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Veterinarios.Queries;

public record GetVeterinariansQuery(bool? ActiveOnly = null) : IRequest<IEnumerable<Veterinario>>;

public class GetVeterinariansQueryHandler : IRequestHandler<GetVeterinariansQuery, IEnumerable<Veterinario>>
{
    private readonly IPetClinicDbContext _context;

    public GetVeterinariansQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Veterinario>> Handle(GetVeterinariansQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Veterinarios.AsNoTracking();

        if (request.ActiveOnly.HasValue)
        {
            query = query.Where(v => v.Activo == request.ActiveOnly.Value);
        }

        return await query.OrderBy(v => v.NombreCompleto).ToListAsync(cancellationToken);
    }
}

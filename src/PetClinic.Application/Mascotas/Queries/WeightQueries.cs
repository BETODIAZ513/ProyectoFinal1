using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Mascotas.Queries;

public record GetWeightHistoryQuery(int MascotaId) : IRequest<IEnumerable<RegistroPeso>>;

public class GetWeightHistoryQueryHandler : IRequestHandler<GetWeightHistoryQuery, IEnumerable<RegistroPeso>>
{
    private readonly IPetClinicDbContext _context;

    public GetWeightHistoryQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RegistroPeso>> Handle(GetWeightHistoryQuery request, CancellationToken cancellationToken)
    {
        return await _context.Pesos
            .AsNoTracking()
            .Where(p => p.MascotaId == request.MascotaId)
            .OrderByDescending(p => p.FechaRegistro)
            .ToListAsync(cancellationToken);
    }
}

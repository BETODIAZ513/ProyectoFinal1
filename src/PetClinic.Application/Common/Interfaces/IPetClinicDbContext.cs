using Microsoft.EntityFrameworkCore;
using PetClinic.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Common.Interfaces;

public interface IPetClinicDbContext
{
    DbSet<Propietario> Propietarios { get; }
    DbSet<Veterinario> Veterinarios { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

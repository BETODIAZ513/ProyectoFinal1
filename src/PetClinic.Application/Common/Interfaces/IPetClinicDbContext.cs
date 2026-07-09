using Microsoft.EntityFrameworkCore;
using PetClinic.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Common.Interfaces;

public interface IPetClinicDbContext
{
    DbSet<Propietario> Propietarios { get; }
    DbSet<Veterinario> Veterinarios { get; }
    DbSet<Mascota> Mascotas { get; }
    DbSet<RegistroPeso> Pesos { get; }
    DbSet<Cita> Citas { get; }
    DbSet<DetalleConsulta> DetallesConsultas { get; }
    DbSet<TareaPredefinida> TareasPredefinidas { get; }
    DbSet<TareaClinica> TareasClinicas { get; }
    DbSet<Hospitalizacion> Hospitalizaciones { get; }
    DbSet<MonitoreoClinico> MonitoreosClinicos { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

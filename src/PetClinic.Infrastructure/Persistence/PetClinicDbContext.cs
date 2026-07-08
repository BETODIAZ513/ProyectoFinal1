using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using PetClinic.Infrastructure.Identity;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Infrastructure.Persistence;

public class PetClinicDbContext : IdentityDbContext<ApplicationUser>, IPetClinicDbContext
{
    private readonly ICurrentUserService _currentUserService;

    public PetClinicDbContext(
        DbContextOptions<PetClinicDbContext> options,
        ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<Propietario> Propietarios => Set<Propietario>();
    public DbSet<Veterinario> Veterinarios => Set<Veterinario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de Propietario
        modelBuilder.Entity<Propietario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NombreCompleto).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Telefono).HasMaxLength(20).IsRequired();
            entity.Property(e => e.CorreoElectronico).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Direccion).HasMaxLength(200);
            entity.HasIndex(e => e.CorreoElectronico).IsUnique();
        });

        // Configuración de Veterinario
        modelBuilder.Entity<Veterinario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NombreCompleto).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Especialidad).HasMaxLength(100).IsRequired();
            entity.Property(e => e.NumeroColegiatura).HasMaxLength(30).IsRequired();
            entity.Property(e => e.Telefono).HasMaxLength(20).IsRequired();
            entity.Property(e => e.CorreoElectronico).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.CorreoElectronico).IsUnique();
        });

        // Configuración dinámica de Shadow Properties de auditoría
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;
            if (clrType == null) continue;

            var name = clrType.Name;

            // REQ-SEG-03: Excluir TareasPredefinidas y RegistroPeso de la auditoría
            if (name == "TareasPredefinidas" || name == "RegistroPeso")
                continue;

            // Aplicar shadow properties únicamente a entidades del dominio
            if (clrType.Namespace != null && clrType.Namespace.StartsWith("PetClinic.Domain"))
            {
                modelBuilder.Entity(clrType).Property<string>("CreatedBy").HasMaxLength(100);
                modelBuilder.Entity(clrType).Property<DateTime>("CreatedAt");
                modelBuilder.Entity(clrType).Property<DateTime?>("UpdatedAt");
            }
        }
    }

    public override int SaveChanges()
    {
        ApplyAuditInfo();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditInfo();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditInfo()
    {
        var userId = _currentUserService.UserId ?? "System";
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries())
        {
            var clrType = entry.Entity.GetType();
            var name = clrType.Name;

            // Validar exclusiones
            if (name == "TareasPredefinidas" || name == "RegistroPeso")
                continue;

            // Solo auditar entidades que pertenezcan al dominio
            if (clrType.Namespace != null && clrType.Namespace.StartsWith("PetClinic.Domain"))
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Property("CreatedBy").CurrentValue = userId;
                    entry.Property("CreatedAt").CurrentValue = now;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Property("UpdatedAt").CurrentValue = now;
                    
                    // REQ-SEG-03: CreatedBy y CreatedAt NO DEBEN ser alterados en actualizaciones
                    entry.Property("CreatedBy").IsModified = false;
                    entry.Property("CreatedAt").IsModified = false;
                }
            }
        }
    }
}

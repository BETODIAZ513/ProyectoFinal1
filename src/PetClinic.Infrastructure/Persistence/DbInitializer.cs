using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using PetClinic.Infrastructure.Identity;

namespace PetClinic.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedDataAsync(
        PetClinicDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        // 1. Asegurar Roles (Requerido para la infraestructura de autorización)
        var roles = new[] { "Administrador", "Veterinario", "AuxiliarClinico", "Recepcionista", "Propietario" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }
}

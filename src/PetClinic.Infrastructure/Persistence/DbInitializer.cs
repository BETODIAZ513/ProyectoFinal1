using Microsoft.AspNetCore.Identity;
using PetClinic.Infrastructure.Identity;
using System.Threading.Tasks;

namespace PetClinic.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedDataAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        var roles = new[] { "Administrador", "Veterinario", "AuxiliarClinico", "Recepcionista" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Crear Administrador de prueba
        var adminEmail = "admin@petclinic.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = "admin",
                Email = adminEmail,
                NombreCompleto = "Administrador de Pruebas",
                EmailConfirmed = true,
                Activo = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Administrador");
            }
        }

        // Crear Veterinario de prueba
        var vetEmail = "veterinario@petclinic.com";
        if (await userManager.FindByEmailAsync(vetEmail) == null)
        {
            var vetUser = new ApplicationUser
            {
                UserName = "veterinario",
                Email = vetEmail,
                NombreCompleto = "Dr. Pérez Veterinario",
                EmailConfirmed = true,
                Activo = true
            };

            var result = await userManager.CreateAsync(vetUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(vetUser, "Veterinario");
            }
        }

        // Crear Auxiliar Clínico de prueba
        var auxEmail = "auxiliar@petclinic.com";
        if (await userManager.FindByEmailAsync(auxEmail) == null)
        {
            var auxUser = new ApplicationUser
            {
                UserName = "auxiliar",
                Email = auxEmail,
                NombreCompleto = "Juan Auxiliar Clínico",
                EmailConfirmed = true,
                Activo = true
            };

            var result = await userManager.CreateAsync(auxUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(auxUser, "AuxiliarClinico");
            }
        }

        // Crear Recepcionista de prueba
        var recEmail = "recepcionista@petclinic.com";
        if (await userManager.FindByEmailAsync(recEmail) == null)
        {
            var recUser = new ApplicationUser
            {
                UserName = "recepcionista",
                Email = recEmail,
                NombreCompleto = "María Recepcionista",
                EmailConfirmed = true,
                Activo = true
            };

            var result = await userManager.CreateAsync(recUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(recUser, "Recepcionista");
            }
        }
    }
}

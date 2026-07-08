using Microsoft.AspNetCore.Identity;
using PetClinic.Application.Common.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PetClinic.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public IdentityService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<(bool Succeeded, string UserId, string ErrorMessage)> CreateUserAsync(
        string userName, 
        string email, 
        string password, 
        string fullName, 
        IEnumerable<string> roles)
    {
        var user = new ApplicationUser
        {
            UserName = userName,
            Email = email,
            NombreCompleto = fullName,
            Activo = true
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Error al crear la cuenta de usuario.";
            return (false, string.Empty, firstError);
        }

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
            }
            await _userManager.AddToRoleAsync(user, role);
        }

        return (true, user.Id, string.Empty);
    }
}

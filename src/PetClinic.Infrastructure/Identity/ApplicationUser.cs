using Microsoft.AspNetCore.Identity;

namespace PetClinic.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string NombreCompleto { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
}

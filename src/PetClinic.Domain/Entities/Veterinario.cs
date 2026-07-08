using System;

namespace PetClinic.Domain.Entities;

public class Veterinario
{
    public int Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Especialidad { get; set; } = string.Empty;
    public string NumeroColegiatura { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string CorreoElectronico { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
    
    // Relación 1:1 física con el usuario de Identity
    public string ApplicationUserId { get; set; } = string.Empty;
}

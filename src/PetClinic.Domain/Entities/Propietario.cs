using System;

namespace PetClinic.Domain.Entities;

public class Propietario
{
    public int Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string CorreoElectronico { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
}

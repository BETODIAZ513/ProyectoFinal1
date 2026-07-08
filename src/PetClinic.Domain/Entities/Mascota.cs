using System;

namespace PetClinic.Domain.Entities;

public class Mascota
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Especie { get; set; } = string.Empty;
    public string Raza { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public string Sexo { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int PropietarioId { get; set; }
    public bool Activo { get; set; } = true;
}

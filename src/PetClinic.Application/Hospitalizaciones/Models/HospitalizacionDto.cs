using System;

namespace PetClinic.Application.Hospitalizaciones.Models;

public class HospitalizacionDto
{
    public int Id { get; set; }
    public int MascotaId { get; set; }
    public string MascotaNombre { get; set; } = string.Empty;
    public string Especie { get; set; } = string.Empty;
    public string Raza { get; set; } = string.Empty;
    public string Sexo { get; set; } = string.Empty;
    public DateTime FechaIngreso { get; set; }
    public DateTime? FechaAlta { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string NumeroJaula { get; set; } = string.Empty;
}

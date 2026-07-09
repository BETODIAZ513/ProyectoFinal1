using System;

namespace PetClinic.Domain.Entities;

public class Hospitalizacion
{
    public int Id { get; set; }
    public int MascotaId { get; set; }
    public DateTime FechaIngreso { get; set; }
    public DateTime? FechaAlta { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = "Internado"; // Internado, Alta
    public string NumeroJaula { get; set; } = string.Empty;
}

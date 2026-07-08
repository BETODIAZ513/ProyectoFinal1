using System;

namespace PetClinic.Application.Citas.Models;

public class CitaDto
{
    public int Id { get; set; }
    public int MascotaId { get; set; }
    public string MascotaNombre { get; set; } = string.Empty;
    public int VeterinarioId { get; set; }
    public string VeterinarioNombreCompleto { get; set; } = string.Empty;
    public string PropietarioNombreCompleto { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
}

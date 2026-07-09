using System;

namespace PetClinic.Application.Consultas.Models;

public class DetalleConsultaDto
{
    public int Id { get; set; }
    public int CitaId { get; set; }
    public int MascotaId { get; set; }
    public int VeterinarioId { get; set; }
    public string VeterinarioNombreCompleto { get; set; } = string.Empty;
    public DateTime FechaAtencion { get; set; }
    public string Diagnostico { get; set; } = string.Empty;
    public string Tratamiento { get; set; } = string.Empty;
    public string NotasAdicionales { get; set; } = string.Empty;
}

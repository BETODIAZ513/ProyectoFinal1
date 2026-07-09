using System;

namespace PetClinic.Application.Consultas.Models;

public class PortalConsultaDto
{
    public int Id { get; set; }
    public DateTime FechaAtencion { get; set; }
    public string Diagnostico { get; set; } = string.Empty;
    public string Tratamiento { get; set; } = string.Empty;
    public string VeterinarioNombreCompleto { get; set; } = string.Empty;
}

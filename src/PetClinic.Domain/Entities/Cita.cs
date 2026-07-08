using System;

namespace PetClinic.Domain.Entities;

public class Cita
{
    public int Id { get; set; }
    public int MascotaId { get; set; }
    public int VeterinarioId { get; set; }
    public DateTime FechaHora { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = "Agendada"; // Agendada, Completada, Cancelada
}

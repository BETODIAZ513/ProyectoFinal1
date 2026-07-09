namespace PetClinic.Application.Tareas.Models;

public class TareaClinicaDto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty; // Pendiente, En Progreso, Completada
    public int MascotaId { get; set; }
    public string MascotaNombre { get; set; } = string.Empty;
    public int VeterinarioId { get; set; }
    public string VeterinarioNombre { get; set; } = string.Empty;
    public int? CitaId { get; set; }
}

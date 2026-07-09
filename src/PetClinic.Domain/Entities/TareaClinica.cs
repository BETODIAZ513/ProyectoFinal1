namespace PetClinic.Domain.Entities;

public class TareaClinica
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Estado { get; set; } = "Pendiente"; // Pendiente, En Progreso, Completada
    public int MascotaId { get; set; }
    public int VeterinarioId { get; set; }
    public int? CitaId { get; set; }
}

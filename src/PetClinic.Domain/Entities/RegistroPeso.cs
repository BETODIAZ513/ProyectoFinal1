using System;

namespace PetClinic.Domain.Entities;

public class RegistroPeso
{
    public int Id { get; set; }
    public DateTime FechaRegistro { get; set; }
    public double PesoKg { get; set; }
    public int MascotaId { get; set; }
}

using System;

namespace PetClinic.Application.Hospitalizaciones.Models;

public class MonitoreoClinicoDto
{
    public int Id { get; set; }
    public int HospitalizacionId { get; set; }
    public DateTime FechaHora { get; set; }
    public int FrecuenciaCardiaca { get; set; }
    public int FrecuenciaRespiratoria { get; set; }
    public decimal Temperatura { get; set; }
    public string EstadoAlerta { get; set; } = string.Empty;
    public string MedicamentosAdministrados { get; set; } = string.Empty;
    public string NotasMonitoreo { get; set; } = string.Empty;
    public string RegistradoPor { get; set; } = string.Empty;
}

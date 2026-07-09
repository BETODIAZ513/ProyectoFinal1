using System;

namespace PetClinic.Domain.Entities;

public class MonitoreoClinico
{
    public int Id { get; set; }
    public int HospitalizacionId { get; set; }
    public DateTime FechaHora { get; set; }
    public int FrecuenciaCardiaca { get; set; } // lpm
    public int FrecuenciaRespiratoria { get; set; } // rpm
    public decimal Temperatura { get; set; } // °C
    public string EstadoAlerta { get; set; } = string.Empty; // Alerta, Deprimido, Estuporoso, Comatoso
    public string MedicamentosAdministrados { get; set; } = string.Empty;
    public string NotasMonitoreo { get; set; } = string.Empty;
    public string RegistradoPor { get; set; } = string.Empty;
}

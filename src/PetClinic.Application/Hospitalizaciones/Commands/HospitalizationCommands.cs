using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Hospitalizaciones.Commands;

public record AdmitPatientCommand(int MascotaId, string Motivo, string NumeroJaula) : IRequest<int>;

public class AdmitPatientCommandHandler : IRequestHandler<AdmitPatientCommand, int>
{
    private readonly IPetClinicDbContext _context;

    public AdmitPatientCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(AdmitPatientCommand request, CancellationToken cancellationToken)
    {
        // 1. Validar Mascota
        var pet = await _context.Mascotas.FindAsync(new object[] { request.MascotaId }, cancellationToken);
        if (pet == null || !pet.Activo)
        {
            throw new Exception("La mascota especificada no existe o se encuentra inactiva.");
        }

        // 2. Validar que la mascota no esté ya hospitalizada
        var yaHospitalizada = await _context.Hospitalizaciones
            .AnyAsync(h => h.MascotaId == request.MascotaId && h.Estado == "Internado", cancellationToken);
        if (yaHospitalizada)
        {
            throw new Exception("La mascota ya se encuentra hospitalizada.");
        }

        // 3. Validar que la jaula no esté ocupada
        var jaulaOcupada = await _context.Hospitalizaciones
            .AnyAsync(h => h.NumeroJaula == request.NumeroJaula && h.Estado == "Internado", cancellationToken);
        if (jaulaOcupada)
        {
            throw new Exception($"La jaula número {request.NumeroJaula} ya se encuentra ocupada por otro paciente.");
        }

        var hosp = new Hospitalizacion
        {
            MascotaId = request.MascotaId,
            Motivo = request.Motivo,
            NumeroJaula = request.NumeroJaula,
            FechaIngreso = DateTime.UtcNow,
            Estado = "Internado"
        };

        _context.Hospitalizaciones.Add(hosp);
        await _context.SaveChangesAsync(cancellationToken);

        return hosp.Id;
    }
}

public record DischargePatientCommand(int Id) : IRequest<bool>;

public class DischargePatientCommandHandler : IRequestHandler<DischargePatientCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public DischargePatientCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DischargePatientCommand request, CancellationToken cancellationToken)
    {
        var hosp = await _context.Hospitalizaciones.FindAsync(new object[] { request.Id }, cancellationToken);
        if (hosp == null)
        {
            return false;
        }

        if (hosp.Estado == "Alta")
        {
            throw new Exception("El paciente ya ha sido dado de alta.");
        }

        hosp.Estado = "Alta";
        hosp.FechaAlta = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record CreateMonitoringRecordCommand(
    int HospitalizacionId, 
    int FrecuenciaCardiaca, 
    int FrecuenciaRespiratoria, 
    decimal Temperatura, 
    string EstadoAlerta, 
    string MedicamentosAdministrados, 
    string NotasMonitoreo,
    string RegistradoPor) : IRequest<int>;

public class CreateMonitoringRecordCommandHandler : IRequestHandler<CreateMonitoringRecordCommand, int>
{
    private readonly IPetClinicDbContext _context;

    public CreateMonitoringRecordCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateMonitoringRecordCommand request, CancellationToken cancellationToken)
    {
        // 1. Validar Hospitalización activa
        var hosp = await _context.Hospitalizaciones.FindAsync(new object[] { request.HospitalizacionId }, cancellationToken);
        if (hosp == null)
        {
            throw new Exception("El registro de hospitalización especificado no existe.");
        }

        if (hosp.Estado == "Alta")
        {
            throw new Exception("No se pueden registrar monitoreos clínicos para un paciente dado de alta.");
        }

        var mon = new MonitoreoClinico
        {
            HospitalizacionId = request.HospitalizacionId,
            FechaHora = DateTime.UtcNow,
            FrecuenciaCardiaca = request.FrecuenciaCardiaca,
            FrecuenciaRespiratoria = request.FrecuenciaRespiratoria,
            Temperatura = request.Temperatura,
            EstadoAlerta = request.EstadoAlerta,
            MedicamentosAdministrados = request.MedicamentosAdministrados ?? string.Empty,
            NotasMonitoreo = request.NotasMonitoreo ?? string.Empty,
            RegistradoPor = request.RegistradoPor ?? "Usuario Clínico"
        };

        _context.MonitoreosClinicos.Add(mon);
        await _context.SaveChangesAsync(cancellationToken);

        return mon.Id;
    }
}

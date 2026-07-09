using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Hospitalizaciones.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Hospitalizaciones.Queries;

public record GetHospitalizedPatientsQuery : IRequest<IEnumerable<HospitalizacionDto>>;

public class GetHospitalizedPatientsQueryHandler : IRequestHandler<GetHospitalizedPatientsQuery, IEnumerable<HospitalizacionDto>>
{
    private readonly IPetClinicDbContext _context;

    public GetHospitalizedPatientsQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HospitalizacionDto>> Handle(GetHospitalizedPatientsQuery request, CancellationToken cancellationToken)
    {
        var query = from h in _context.Hospitalizaciones.AsNoTracking()
                    join m in _context.Mascotas.AsNoTracking() on h.MascotaId equals m.Id
                    where h.Estado == "Internado"
                    select new HospitalizacionDto
                    {
                        Id = h.Id,
                        MascotaId = h.MascotaId,
                        MascotaNombre = m.Nombre,
                        Especie = m.Especie,
                        Raza = m.Raza,
                        Sexo = m.Sexo,
                        FechaIngreso = h.FechaIngreso,
                        FechaAlta = h.FechaAlta,
                        Motivo = h.Motivo,
                        Estado = h.Estado,
                        NumeroJaula = h.NumeroJaula
                    };

        return await query.OrderBy(dto => dto.NumeroJaula).ToListAsync(cancellationToken);
    }
}

public record GetMonitoringHistoryQuery(int HospitalizacionId) : IRequest<IEnumerable<MonitoreoClinicoDto>>;

public class GetMonitoringHistoryQueryHandler : IRequestHandler<GetMonitoringHistoryQuery, IEnumerable<MonitoreoClinicoDto>>
{
    private readonly IPetClinicDbContext _context;

    public GetMonitoringHistoryQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MonitoreoClinicoDto>> Handle(GetMonitoringHistoryQuery request, CancellationToken cancellationToken)
    {
        return await _context.MonitoreosClinicos
            .AsNoTracking()
            .Where(m => m.HospitalizacionId == request.HospitalizacionId)
            .OrderByDescending(m => m.FechaHora)
            .Select(m => new MonitoreoClinicoDto
            {
                Id = m.Id,
                HospitalizacionId = m.HospitalizacionId,
                FechaHora = m.FechaHora,
                FrecuenciaCardiaca = m.FrecuenciaCardiaca,
                FrecuenciaRespiratoria = m.FrecuenciaRespiratoria,
                Temperatura = m.Temperatura,
                EstadoAlerta = m.EstadoAlerta,
                MedicamentosAdministrados = m.MedicamentosAdministrados,
                NotasMonitoreo = m.NotasMonitoreo,
                RegistradoPor = m.RegistradoPor
            })
            .ToListAsync(cancellationToken);
    }
}

public record GetActiveHospitalizationByPetQuery(int MascotaId) : IRequest<HospitalizacionDto?>;

public class GetActiveHospitalizationByPetQueryHandler : IRequestHandler<GetActiveHospitalizationByPetQuery, HospitalizacionDto?>
{
    private readonly IPetClinicDbContext _context;

    public GetActiveHospitalizationByPetQueryHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<HospitalizacionDto?> Handle(GetActiveHospitalizationByPetQuery request, CancellationToken cancellationToken)
    {
        var activeHosp = await (from h in _context.Hospitalizaciones.AsNoTracking()
                                join m in _context.Mascotas.AsNoTracking() on h.MascotaId equals m.Id
                                where h.MascotaId == request.MascotaId && h.Estado == "Internado"
                                select new HospitalizacionDto
                                {
                                    Id = h.Id,
                                    MascotaId = h.MascotaId,
                                    MascotaNombre = m.Nombre,
                                    Especie = m.Especie,
                                    Raza = m.Raza,
                                    Sexo = m.Sexo,
                                    FechaIngreso = h.FechaIngreso,
                                    FechaAlta = h.FechaAlta,
                                    Motivo = h.Motivo,
                                    Estado = h.Estado,
                                    NumeroJaula = h.NumeroJaula
                                }).FirstOrDefaultAsync(cancellationToken);

        return activeHosp;
    }
}

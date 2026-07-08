using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Mascotas.Commands;

public record CreateWeightRecordCommand(double PesoKg, DateTime FechaRegistro, int MascotaId) : IRequest<int>;

public class CreateWeightRecordCommandHandler : IRequestHandler<CreateWeightRecordCommand, int>
{
    private readonly IPetClinicDbContext _context;

    public CreateWeightRecordCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateWeightRecordCommand request, CancellationToken cancellationToken)
    {
        var mascota = await _context.Mascotas.FindAsync(new object[] { request.MascotaId }, cancellationToken);
        if (mascota == null)
        {
            throw new Exception("La mascota especificada no existe.");
        }
        if (!mascota.Activo)
        {
            throw new Exception("No se pueden registrar pesos para una mascota inactiva o dada de baja.");
        }

        var registro = new RegistroPeso
        {
            PesoKg = request.PesoKg,
            FechaRegistro = request.FechaRegistro,
            MascotaId = request.MascotaId
        };

        _context.Pesos.Add(registro);
        await _context.SaveChangesAsync(cancellationToken);

        return registro.Id;
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Propietarios.Commands;

public record CreateOwnerCommand(string NombreCompleto, string Telefono, string CorreoElectronico, string Direccion) : IRequest<int>;

public class CreateOwnerCommandHandler : IRequestHandler<CreateOwnerCommand, int>
{
    private readonly IPetClinicDbContext _context;

    public CreateOwnerCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateOwnerCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Propietarios.AnyAsync(p => p.CorreoElectronico == request.CorreoElectronico, cancellationToken);
        if (exists)
        {
            throw new Exception("El correo electrónico ya se encuentra registrado.");
        }

        var propietario = new Propietario
        {
            NombreCompleto = request.NombreCompleto,
            Telefono = request.Telefono,
            CorreoElectronico = request.CorreoElectronico,
            Direccion = request.Direccion,
            Activo = true
        };

        _context.Propietarios.Add(propietario);
        await _context.SaveChangesAsync(cancellationToken);

        return propietario.Id;
    }
}

public record UpdateOwnerCommand(int Id, string NombreCompleto, string Telefono, string CorreoElectronico, string Direccion) : IRequest<bool>;

public class UpdateOwnerCommandHandler : IRequestHandler<UpdateOwnerCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public UpdateOwnerCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateOwnerCommand request, CancellationToken cancellationToken)
    {
        var propietario = await _context.Propietarios.FindAsync(new object[] { request.Id }, cancellationToken);
        if (propietario == null)
        {
            return false;
        }

        var exists = await _context.Propietarios.AnyAsync(p => p.CorreoElectronico == request.CorreoElectronico && p.Id != request.Id, cancellationToken);
        if (exists)
        {
            throw new Exception("El correo electrónico ya está registrado por otro propietario.");
        }

        propietario.NombreCompleto = request.NombreCompleto;
        propietario.Telefono = request.Telefono;
        propietario.CorreoElectronico = request.CorreoElectronico;
        propietario.Direccion = request.Direccion;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record DeleteOwnerCommand(int Id) : IRequest<bool>;

public class DeleteOwnerCommandHandler : IRequestHandler<DeleteOwnerCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public DeleteOwnerCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteOwnerCommand request, CancellationToken cancellationToken)
    {
        var propietario = await _context.Propietarios.FindAsync(new object[] { request.Id }, cancellationToken);
        if (propietario == null)
        {
            return false;
        }

        // REQ-PRO-01: Baja lógica
        propietario.Activo = false;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

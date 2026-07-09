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

public record GenerarCodigoVinculacionCommand(int PropietarioId) : IRequest<string>;

public class GenerarCodigoVinculacionCommandHandler : IRequestHandler<GenerarCodigoVinculacionCommand, string>
{
    private readonly IPetClinicDbContext _context;

    public GenerarCodigoVinculacionCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<string> Handle(GenerarCodigoVinculacionCommand request, CancellationToken cancellationToken)
    {
        var propietario = await _context.Propietarios.FindAsync(new object[] { request.PropietarioId }, cancellationToken);
        if (propietario == null)
        {
            throw new Exception("Propietario no encontrado.");
        }

        var random = new Random();
        var code = random.Next(100000, 999999).ToString();

        propietario.CodigoVinculacion = code;
        propietario.ExpiracionCodigo = DateTime.UtcNow.AddSeconds(150);

        await _context.SaveChangesAsync(cancellationToken);
        return code;
    }
}

public record VincularPortalCommand(string FirebaseUserId, string Correo, string Codigo) : IRequest<bool>;

public class VincularPortalCommandHandler : IRequestHandler<VincularPortalCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public VincularPortalCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(VincularPortalCommand request, CancellationToken cancellationToken)
    {
        var propietario = await _context.Propietarios
            .FirstOrDefaultAsync(p => p.CodigoVinculacion == request.Codigo, cancellationToken);

        if (propietario == null)
        {
            throw new Exception("Código de vinculación inválido.");
        }

        if (propietario.ExpiracionCodigo.HasValue && DateTime.UtcNow > propietario.ExpiracionCodigo.Value)
        {
            throw new Exception("El código ha expirado. Por favor, solicita uno nuevo en recepción.");
        }

        if (!string.Equals(propietario.CorreoElectronico, request.Correo, StringComparison.OrdinalIgnoreCase))
        {
            throw new Exception("El correo de la cuenta de Google no coincide con el correo registrado en la clínica.");
        }

        // Vincular y activar inmediatamente
        propietario.FirebaseUserId = request.FirebaseUserId;
        propietario.CorreoElectronico = request.Correo;
        propietario.CodigoVinculacion = null;
        propietario.ExpiracionCodigo = null;
        propietario.Activo = true;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record RegistrarPropietarioRemotoCommand(string NombreCompleto, string Telefono, string CorreoElectronico, string Direccion, string FirebaseUserId) : IRequest<int>;

public class RegistrarPropietarioRemotoCommandHandler : IRequestHandler<RegistrarPropietarioRemotoCommand, int>
{
    private readonly IPetClinicDbContext _context;

    public RegistrarPropietarioRemotoCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(RegistrarPropietarioRemotoCommand request, CancellationToken cancellationToken)
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
            FirebaseUserId = request.FirebaseUserId,
            Activo = false // Pendiente de verificación
        };

        _context.Propietarios.Add(propietario);
        await _context.SaveChangesAsync(cancellationToken);

        return propietario.Id;
    }
}

public record ActivarPropietarioCommand(int Id) : IRequest<bool>;

public class ActivarPropietarioCommandHandler : IRequestHandler<ActivarPropietarioCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public ActivarPropietarioCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ActivarPropietarioCommand request, CancellationToken cancellationToken)
    {
        var propietario = await _context.Propietarios.FindAsync(new object[] { request.Id }, cancellationToken);
        if (propietario == null) return false;

        propietario.Activo = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

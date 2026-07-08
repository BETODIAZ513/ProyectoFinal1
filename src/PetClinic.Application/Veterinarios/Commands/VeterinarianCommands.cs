using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Veterinarios.Commands;

public record CreateVeterinarianCommand(
    string NombreCompleto, 
    string Especialidad, 
    string NumeroColegiatura, 
    string Telefono, 
    string CorreoElectronico, 
    string Password) : IRequest<int>;

public class CreateVeterinarianCommandHandler : IRequestHandler<CreateVeterinarianCommand, int>
{
    private readonly IPetClinicDbContext _context;
    private readonly IIdentityService _identityService;

    public CreateVeterinarianCommandHandler(IPetClinicDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<int> Handle(CreateVeterinarianCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Veterinarios.AnyAsync(v => v.CorreoElectronico == request.CorreoElectronico, cancellationToken);
        if (exists)
        {
            throw new Exception("El correo electrónico del veterinario ya se encuentra registrado.");
        }

        // Crear cuenta Identity simultáneamente (REQ-VET-01)
        var (succeeded, identityUserId, errorMessage) = await _identityService.CreateUserAsync(
            request.CorreoElectronico, // Username
            request.CorreoElectronico, // Email
            request.Password, 
            request.NombreCompleto, 
            new[] { "Veterinario" }
        );

        if (!succeeded)
        {
            throw new Exception($"Error al crear cuenta de acceso: {errorMessage}");
        }

        var veterinario = new Veterinario
        {
            NombreCompleto = request.NombreCompleto,
            Especialidad = request.Especialidad,
            NumeroColegiatura = request.NumeroColegiatura,
            Telefono = request.Telefono,
            CorreoElectronico = request.CorreoElectronico,
            Activo = true,
            ApplicationUserId = identityUserId
        };

        _context.Veterinarios.Add(veterinario);
        await _context.SaveChangesAsync(cancellationToken);

        return veterinario.Id;
    }
}

public record UpdateVeterinarianCommand(
    int Id, 
    string NombreCompleto, 
    string Especialidad, 
    string NumeroColegiatura, 
    string Telefono, 
    string CorreoElectronico) : IRequest<bool>;

public class UpdateVeterinarianCommandHandler : IRequestHandler<UpdateVeterinarianCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public UpdateVeterinarianCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateVeterinarianCommand request, CancellationToken cancellationToken)
    {
        var veterinario = await _context.Veterinarios.FindAsync(new object[] { request.Id }, cancellationToken);
        if (veterinario == null)
        {
            return false;
        }

        var exists = await _context.Veterinarios.AnyAsync(v => v.CorreoElectronico == request.CorreoElectronico && v.Id != request.Id, cancellationToken);
        if (exists)
        {
            throw new Exception("El correo electrónico ya está registrado por otro veterinario.");
        }

        veterinario.NombreCompleto = request.NombreCompleto;
        veterinario.Especialidad = request.Especialidad;
        veterinario.NumeroColegiatura = request.NumeroColegiatura;
        veterinario.Telefono = request.Telefono;
        veterinario.CorreoElectronico = request.CorreoElectronico;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record DeleteVeterinarianCommand(int Id) : IRequest<bool>;

public class DeleteVeterinarianCommandHandler : IRequestHandler<DeleteVeterinarianCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public DeleteVeterinarianCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteVeterinarianCommand request, CancellationToken cancellationToken)
    {
        var veterinario = await _context.Veterinarios.FindAsync(new object[] { request.Id }, cancellationToken);
        if (veterinario == null)
        {
            return false;
        }

        // Baja lógica
        veterinario.Activo = false;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

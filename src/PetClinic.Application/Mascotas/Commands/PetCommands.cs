using MediatR;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.Mascotas.Commands;

public record CreatePetCommand(
    string Nombre, 
    string Especie, 
    string Raza, 
    DateTime FechaNacimiento, 
    string Sexo, 
    string Color, 
    int PropietarioId) : IRequest<int>;

public class CreatePetCommandHandler : IRequestHandler<CreatePetCommand, int>
{
    private readonly IPetClinicDbContext _context;

    public CreatePetCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreatePetCommand request, CancellationToken cancellationToken)
    {
        var owner = await _context.Propietarios.FindAsync(new object[] { request.PropietarioId }, cancellationToken);
        if (owner == null)
        {
            throw new Exception("El propietario especificado no existe.");
        }
        if (!owner.Activo)
        {
            throw new Exception("No se pueden registrar mascotas para un propietario inactivo.");
        }

        var mascota = new Mascota
        {
            Nombre = request.Nombre,
            Especie = request.Especie,
            Raza = request.Raza,
            FechaNacimiento = request.FechaNacimiento,
            Sexo = request.Sexo,
            Color = request.Color,
            PropietarioId = request.PropietarioId,
            Activo = true
        };

        _context.Mascotas.Add(mascota);
        await _context.SaveChangesAsync(cancellationToken);

        return mascota.Id;
    }
}

public record UpdatePetCommand(
    int Id, 
    string Nombre, 
    string Especie, 
    string Raza, 
    DateTime FechaNacimiento, 
    string Sexo, 
    string Color, 
    int PropietarioId) : IRequest<bool>;

public class UpdatePetCommandHandler : IRequestHandler<UpdatePetCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public UpdatePetCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdatePetCommand request, CancellationToken cancellationToken)
    {
        var mascota = await _context.Mascotas.FindAsync(new object[] { request.Id }, cancellationToken);
        if (mascota == null)
        {
            return false;
        }

        var owner = await _context.Propietarios.FindAsync(new object[] { request.PropietarioId }, cancellationToken);
        if (owner == null)
        {
            throw new Exception("El propietario especificado no existe.");
        }

        mascota.Nombre = request.Nombre;
        mascota.Especie = request.Especie;
        mascota.Raza = request.Raza;
        mascota.FechaNacimiento = request.FechaNacimiento;
        mascota.Sexo = request.Sexo;
        mascota.Color = request.Color;
        mascota.PropietarioId = request.PropietarioId;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record DeletePetCommand(int Id) : IRequest<bool>;

public class DeletePetCommandHandler : IRequestHandler<DeletePetCommand, bool>
{
    private readonly IPetClinicDbContext _context;

    public DeletePetCommandHandler(IPetClinicDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeletePetCommand request, CancellationToken cancellationToken)
    {
        var mascota = await _context.Mascotas.FindAsync(new object[] { request.Id }, cancellationToken);
        if (mascota == null)
        {
            return false;
        }

        mascota.Activo = false;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

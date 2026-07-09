using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Propietarios.Commands;
using PetClinic.Application.Propietarios.Validators;
using PetClinic.Domain.Entities;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class PropietarioTests : TestBase
{
    [TestMethod]
    public async Task Handle_ShouldCreateOwner_WhenValidRequest()
    {
        // Arrange
        using var context = CreateDbContext();
        var handler = new CreateOwnerCommandHandler(context);
        var command = new CreateOwnerCommand(
            "Juan Perez",
            "+51 999999999",
            "juan.perez@clinic.com",
            "Av. Larco 123"
        );

        // Act
        var ownerId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(ownerId > 0);
        var ownerSaved = await context.Propietarios.FindAsync(ownerId);
        Assert.IsNotNull(ownerSaved);
        Assert.AreEqual("Juan Perez", ownerSaved.NombreCompleto);
        Assert.IsTrue(ownerSaved.Activo);
    }

    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenEmailAlreadyExists()
    {
        // Arrange
        using var context = CreateDbContext();
        var existingOwner = new Propietario
        {
            NombreCompleto = "Maria Gomez",
            Telefono = "987654321",
            CorreoElectronico = "duplicate@owner.com",
            Direccion = "Av. Arequipa 456",
            Activo = true
        };
        context.Propietarios.Add(existingOwner);
        await context.SaveChangesAsync();

        var handler = new CreateOwnerCommandHandler(context);
        var command = new CreateOwnerCommand(
            "Maria Gomez Nueva",
            "987654321",
            "duplicate@owner.com",
            "Av. Arequipa 789"
        );

        // Act & Assert
        bool threw = false;
        try
        {
            await handler.Handle(command, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("ya se encuentra registrado"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción si el correo ya existe.");
    }

    [TestMethod]
    public async Task Handle_ShouldLogicalDeleteOwner_WhenDeleting()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario
        {
            Id = 5,
            NombreCompleto = "Carlos Ramirez",
            Telefono = "111222333",
            CorreoElectronico = "carlos@owner.com",
            Direccion = "Javier Prado 999",
            Activo = true
        };
        context.Propietarios.Add(owner);
        await context.SaveChangesAsync();

        var handler = new DeleteOwnerCommandHandler(context);
        var command = new DeleteOwnerCommand(5);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(result);
        var ownerUpdated = await context.Propietarios.FindAsync(5);
        Assert.IsNotNull(ownerUpdated);
        Assert.IsFalse(ownerUpdated.Activo, "El propietario debe ser marcado como inactivo (baja lógica).");
    }

    [TestMethod]
    public void Validator_ShouldFail_WhenEmailIsInvalid()
    {
        // Arrange
        var validator = new CreateOwnerCommandValidator();
        var command = new CreateOwnerCommand(
            "Pedro Picapiedra",
            "123456",
            "correo-invalido-sin-arroba",
            "Piedradura"
        );

        // Act
        var result = validator.Validate(command);

        // Assert
        Assert.IsFalse(result.IsValid);
        Assert.IsTrue(result.Errors.Exists(e => e.PropertyName == "CorreoElectronico" && e.ErrorMessage.Contains("formato")));
    }
}

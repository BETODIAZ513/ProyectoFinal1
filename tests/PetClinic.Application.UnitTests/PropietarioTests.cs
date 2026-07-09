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

    [TestMethod]
    public async Task Handle_ShouldGenerateOtpCode_WhenRequested()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario { Id = 10, NombreCompleto = "Test Otp", Activo = true };
        context.Propietarios.Add(owner);
        await context.SaveChangesAsync();

        var handler = new GenerarCodigoVinculacionCommandHandler(context);
        var command = new GenerarCodigoVinculacionCommand(10);

        // Act
        var code = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsNotNull(code);
        Assert.AreEqual(6, code.Length);
        
        var updated = await context.Propietarios.FindAsync(10);
        Assert.IsNotNull(updated);
        Assert.AreEqual(code, updated.CodigoVinculacion);
        Assert.IsNotNull(updated.ExpiracionCodigo);
        Assert.IsTrue(updated.ExpiracionCodigo.Value > DateTime.UtcNow);
    }

    [TestMethod]
    public async Task Handle_ShouldLinkAccountAndActivate_WhenOtpIsValid()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario 
        { 
            Id = 11, 
            NombreCompleto = "Test Link", 
            CorreoElectronico = "link@test.com",
            Telefono = "123",
            Direccion = "123",
            Activo = false, 
            CodigoVinculacion = "999999", 
            ExpiracionCodigo = DateTime.UtcNow.AddSeconds(150) 
        };
        context.Propietarios.Add(owner);
        await context.SaveChangesAsync();

        var handler = new VincularPortalCommandHandler(context);
        var command = new VincularPortalCommand("firebase-uid-11", "link@test.com", "999999");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(result);
        var updated = await context.Propietarios.FindAsync(11);
        Assert.IsNotNull(updated);
        Assert.IsTrue(updated.Activo);
        Assert.AreEqual("firebase-uid-11", updated.FirebaseUserId);
        Assert.AreEqual("link@test.com", updated.CorreoElectronico);
        Assert.IsNull(updated.CodigoVinculacion);
        Assert.IsNull(updated.ExpiracionCodigo);
    }

    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenOtpIsExpired()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario 
        { 
            Id = 12, 
            NombreCompleto = "Test Expired", 
            CorreoElectronico = "expired@test.com",
            Telefono = "123",
            Direccion = "123",
            Activo = false, 
            CodigoVinculacion = "888888", 
            ExpiracionCodigo = DateTime.UtcNow.AddSeconds(-5) // Expired
        };
        context.Propietarios.Add(owner);
        await context.SaveChangesAsync();

        var handler = new VincularPortalCommandHandler(context);
        var command = new VincularPortalCommand("firebase-uid-12", "expired@test.com", "888888");

        // Act & Assert
        bool threw = false;
        try
        {
            await handler.Handle(command, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("ha expirado"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción porque el código de vinculación expiró.");
    }

    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenEmailsDoNotMatch()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario 
        { 
            Id = 13, 
            NombreCompleto = "Test Mismatch", 
            CorreoElectronico = "registered@test.com",
            Telefono = "123",
            Direccion = "123",
            Activo = false, 
            CodigoVinculacion = "555555", 
            ExpiracionCodigo = DateTime.UtcNow.AddSeconds(150)
        };
        context.Propietarios.Add(owner);
        await context.SaveChangesAsync();

        var handler = new VincularPortalCommandHandler(context);
        var command = new VincularPortalCommand("firebase-uid-13", "wrong@test.com", "555555");

        // Act & Assert
        bool threw = false;
        try
        {
            await handler.Handle(command, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("no coincide"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción porque los correos no coinciden.");
    }

    [TestMethod]
    public async Task Handle_ShouldCreateInactiveOwner_WhenRemoteSignUp()
    {
        // Arrange
        using var context = CreateDbContext();
        var handler = new RegistrarPropietarioRemotoCommandHandler(context);
        var command = new RegistrarPropietarioRemotoCommand("Remote User", "999888777", "remote@test.com", "Remote address", "firebase-remote-uid");

        // Act
        var id = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(id > 0);
        var created = await context.Propietarios.FindAsync(id);
        Assert.IsNotNull(created);
        Assert.IsFalse(created.Activo, "El propietario registrado remotamente debe crearse como inactivo (pendiente).");
        Assert.AreEqual("firebase-remote-uid", created.FirebaseUserId);
        Assert.AreEqual("remote@test.com", created.CorreoElectronico);
    }
}

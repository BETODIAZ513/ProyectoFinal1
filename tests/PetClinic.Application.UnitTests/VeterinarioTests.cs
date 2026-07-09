using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Veterinarios.Commands;
using PetClinic.Domain.Entities;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class VeterinarioTests : TestBase
{
    [TestMethod]
    public async Task Handle_ShouldCreateVeterinarian_WhenValidRequest()
    {
        // Arrange
        using var context = CreateDbContext();
        var identityService = new TestIdentityService();
        var handler = new CreateVeterinarianCommandHandler(context, identityService);

        var command = new CreateVeterinarianCommand(
            "Dr. Manuel Torres",
            "Cardiología",
            "VET4040",
            "987654321",
            "manuel@vet.com",
            "SecurePassword123!"
        );

        // Act
        var vetId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(vetId > 0);
        var vetSaved = await context.Veterinarios.FindAsync(vetId);
        Assert.IsNotNull(vetSaved);
        Assert.AreEqual("Dr. Manuel Torres", vetSaved.NombreCompleto);
        Assert.AreEqual("Mock_User_Id_123", vetSaved.ApplicationUserId);
        Assert.IsTrue(vetSaved.Activo);
    }

    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenEmailAlreadyExists()
    {
        // Arrange
        using var context = CreateDbContext();
        var identityService = new TestIdentityService();

        var existingVet = new Veterinario
        {
            NombreCompleto = "Dr. Duplicado",
            Especialidad = "General",
            NumeroColegiatura = "VET888",
            Telefono = "123",
            CorreoElectronico = "duplicate@vet.com",
            Activo = true
        };
        context.Veterinarios.Add(existingVet);
        await context.SaveChangesAsync();

        var handler = new CreateVeterinarianCommandHandler(context, identityService);

        var command = new CreateVeterinarianCommand(
            "Dr. Nuevo",
            "Cirugía",
            "VET999",
            "456",
            "duplicate@vet.com",
            "Password1!"
        );

        // Act & Assert
        bool threw = false;
        try
        {
            await handler.Handle(command, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("registrado"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción si el correo ya existe.");
    }

    [TestMethod]
    public async Task Handle_ShouldLogicDeleteVeterinarian_WhenDeleting()
    {
        // Arrange
        using var context = CreateDbContext();

        var vet = new Veterinario
        {
            Id = 10,
            NombreCompleto = "Dr. Desactivado",
            Especialidad = "Odontología",
            NumeroColegiatura = "VET9090",
            Telefono = "555",
            CorreoElectronico = "desactivado@vet.com",
            Activo = true
        };
        context.Veterinarios.Add(vet);
        await context.SaveChangesAsync();

        var handler = new DeleteVeterinarianCommandHandler(context, new TestIdentityService());
        var command = new DeleteVeterinarianCommand(10);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(result);
        var vetUpdated = await context.Veterinarios.FindAsync(10);
        Assert.IsNotNull(vetUpdated);
        Assert.IsFalse(vetUpdated.Activo, "El veterinario debería ser marcado como inactivo (baja lógica).");
    }
}

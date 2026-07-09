using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Veterinarios.Commands;
using PetClinic.Application.Veterinarios.Queries;
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

    [TestMethod]
    public async Task Handle_ShouldUpdateVeterinarian_WhenRequestIsValid()
    {
        // Arrange
        using var context = CreateDbContext();
        var vet = new Veterinario
        {
            Id = 5,
            NombreCompleto = "Dr. Carlos Torres",
            Especialidad = "Neurología",
            NumeroColegiatura = "VET5050",
            Telefono = "123",
            CorreoElectronico = "carlos@vet.com",
            Activo = true
        };
        context.Veterinarios.Add(vet);
        await context.SaveChangesAsync();

        var handler = new UpdateVeterinarianCommandHandler(context);
        var command = new UpdateVeterinarianCommand(5, "Dr. Carlos Torres Modificado", "Cardiología", "VET5050-M", "999", "carlos_new@vet.com");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(result);
        var updated = await context.Veterinarios.FindAsync(5);
        Assert.IsNotNull(updated);
        Assert.AreEqual("Dr. Carlos Torres Modificado", updated.NombreCompleto);
        Assert.AreEqual("Cardiología", updated.Especialidad);
        Assert.AreEqual("carlos_new@vet.com", updated.CorreoElectronico);
    }

    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenUpdatingWithDuplicatedEmail()
    {
        // Arrange
        using var context = CreateDbContext();
        var vet1 = new Veterinario { Id = 1, NombreCompleto = "Dr. Uno", CorreoElectronico = "uno@vet.com", Activo = true };
        var vet2 = new Veterinario { Id = 2, NombreCompleto = "Dr. Dos", CorreoElectronico = "dos@vet.com", Activo = true };
        context.Veterinarios.AddRange(vet1, vet2);
        await context.SaveChangesAsync();

        var handler = new UpdateVeterinarianCommandHandler(context);
        var command = new UpdateVeterinarianCommand(2, "Dr. Dos Modificado", "General", "VET222", "123", "uno@vet.com"); // Email exists on vet1

        // Act & Assert
        bool threw = false;
        try
        {
            await handler.Handle(command, CancellationToken.None);
        }
        catch
        {
            threw = true;
        }
        Assert.IsTrue(threw);
    }

    [TestMethod]
    public async Task Handle_ShouldReturnFilteredAndSortedVeterinarians_WhenQuerying()
    {
        // Arrange
        using var context = CreateDbContext();
        var vets = new[]
        {
            new Veterinario { Id = 1, NombreCompleto = "Carlos Delgado", CorreoElectronico = "carlos@vet.com", Activo = true },
            new Veterinario { Id = 2, NombreCompleto = "Ana Alvarez", CorreoElectronico = "ana@vet.com", Activo = true },
            new Veterinario { Id = 3, NombreCompleto = "Beatriz Blanco", CorreoElectronico = "beatriz@vet.com", Activo = false }
        };
        context.Veterinarios.AddRange(vets);
        await context.SaveChangesAsync();

        var handler = new GetVeterinariansQueryHandler(context);
        
        // Act (active only)
        var resultActive = (await handler.Handle(new GetVeterinariansQuery(true), CancellationToken.None)).ToList();
        // Act (all)
        var resultAll = (await handler.Handle(new GetVeterinariansQuery(), CancellationToken.None)).ToList();

        // Assert
        Assert.AreEqual(2, resultActive.Count);
        Assert.AreEqual("Ana Alvarez", resultActive[0].NombreCompleto); // Alphabetical sort
        Assert.AreEqual("Carlos Delgado", resultActive[1].NombreCompleto);

        Assert.AreEqual(3, resultAll.Count);
        Assert.AreEqual("Ana Alvarez", resultAll[0].NombreCompleto);
        Assert.AreEqual("Beatriz Blanco", resultAll[1].NombreCompleto);
        Assert.AreEqual("Carlos Delgado", resultAll[2].NombreCompleto);
    }
}

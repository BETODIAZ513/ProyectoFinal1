using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Mascotas.Commands;
using PetClinic.Application.Mascotas.Validators;
using PetClinic.Domain.Entities;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class MascotaTests : TestBase
{
    [TestMethod]
    public void Verify_WeightValidator_RejectsNegativeAndZero()
    {
        // Arrange
        var validator = new CreateWeightRecordCommandValidator();

        var commandNegative = new CreateWeightRecordCommand(
            -5.5,
            DateTime.Today,
            1
        );

        var commandZero = new CreateWeightRecordCommand(
            0.0,
            DateTime.Today,
            1
        );

        // Act
        var resultNegative = validator.Validate(commandNegative);
        var resultZero = validator.Validate(commandZero);

        // Assert
        Assert.IsFalse(resultNegative.IsValid);
        Assert.IsTrue(resultNegative.Errors.Exists(e => e.ErrorMessage.Contains("El peso registrado debe ser mayor que cero kg.")));

        Assert.IsFalse(resultZero.IsValid);
        Assert.IsTrue(resultZero.Errors.Exists(e => e.ErrorMessage.Contains("El peso registrado debe ser mayor que cero kg.")));
    }

    [TestMethod]
    public void Verify_WeightValidator_AcceptsPositiveWeight()
    {
        // Arrange
        var validator = new CreateWeightRecordCommandValidator();

        var commandPositive = new CreateWeightRecordCommand(
            10.5,
            DateTime.Today,
            1
        );

        // Act
        var result = validator.Validate(commandPositive);

        // Assert
        Assert.IsTrue(result.IsValid);
    }

    [TestMethod]
    public async Task Handle_ShouldCreatePet_WhenValidRequest()
    {
        // Arrange
        using var context = CreateDbContext();

        var owner = new Propietario
        {
            Id = 1,
            NombreCompleto = "Juan Perez",
            Telefono = "123456",
            CorreoElectronico = "juan@perez.com",
            Direccion = "Calle 123",
            Activo = true
        };
        context.Propietarios.Add(owner);
        await context.SaveChangesAsync();

        var handler = new CreatePetCommandHandler(context);
        var command = new CreatePetCommand(
            "Fido",
            "Perro",
            "Golden",
            DateTime.Today.AddYears(-2),
            "Macho",
            "Dorado",
            1
        );

        // Act
        var petId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(petId > 0);
        var petSaved = await context.Mascotas.FindAsync(petId);
        Assert.IsNotNull(petSaved);
        Assert.AreEqual("Fido", petSaved.Nombre);
        Assert.IsTrue(petSaved.Activo);
    }

    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenOwnerIsInactive()
    {
        // Arrange
        using var context = CreateDbContext();

        var owner = new Propietario
        {
            Id = 2,
            NombreCompleto = "Propietario Inactivo",
            Telefono = "000000",
            CorreoElectronico = "inactivo@owner.com",
            Direccion = "Sin Direccion",
            Activo = false
        };
        context.Propietarios.Add(owner);
        await context.SaveChangesAsync();

        var handler = new CreatePetCommandHandler(context);
        var command = new CreatePetCommand(
            "Rex",
            "Perro",
            "Labrador",
            DateTime.Today.AddYears(-1),
            "Macho",
            "Negro",
            2
        );

        // Act & Assert
        bool threw = false;
        try
        {
            await handler.Handle(command, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("propietario inactivo"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción si el propietario está inactivo.");
    }
}

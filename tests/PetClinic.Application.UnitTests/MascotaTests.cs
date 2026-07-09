using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Mascotas.Commands;
using PetClinic.Application.Mascotas.Validators;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class MascotaTests
{
    [TestMethod]
    public void Verify_WeightValidator_RejectsNegativeAndZero()
    {
        // Arrange
        var validator = new CreateWeightRecordCommandValidator();

        var commandNegative = new CreateWeightRecordCommand(
            MascotaId: 1,
            PesoKg: -5.5,
            FechaRegistro: DateTime.Today
        );

        var commandZero = new CreateWeightRecordCommand(
            MascotaId: 1,
            PesoKg: 0.0,
            FechaRegistro: DateTime.Today
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
            MascotaId: 1,
            PesoKg: 10.5,
            FechaRegistro: DateTime.Today
        );

        // Act
        var result = validator.Validate(commandPositive);

        // Assert
        Assert.IsTrue(result.IsValid);
    }
}

using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Mascotas.Commands;
using PetClinic.Application.Mascotas.Queries;
using PetClinic.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class WeightTests : TestBase
{
    [TestMethod]
    public async Task CreateWeightRecord_ShouldSaveWeight_WhenPetIsActive()
    {
        // Arrange
        using var context = CreateDbContext();
        var pet = new Mascota { Id = 1, Nombre = "Rambo", Activo = true };
        context.Mascotas.Add(pet);
        await context.SaveChangesAsync();

        var handler = new CreateWeightRecordCommandHandler(context);
        var command = new CreateWeightRecordCommand(12.5, DateTime.UtcNow, 1);

        // Act
        var resultId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(resultId > 0);
        var savedRecord = await context.Pesos.FindAsync(resultId);
        Assert.IsNotNull(savedRecord);
        Assert.AreEqual(12.5, savedRecord.PesoKg);
        Assert.AreEqual(1, savedRecord.MascotaId);
    }

    [TestMethod]
    public async Task CreateWeightRecord_ShouldThrowException_WhenPetDoesNotExist()
    {
        // Arrange
        using var context = CreateDbContext();
        var handler = new CreateWeightRecordCommandHandler(context);
        var command = new CreateWeightRecordCommand(10.0, DateTime.UtcNow, 999);

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
    public async Task CreateWeightRecord_ShouldThrowException_WhenPetIsInactive()
    {
        // Arrange
        using var context = CreateDbContext();
        var pet = new Mascota { Id = 2, Nombre = "Inactiva", Activo = false };
        context.Mascotas.Add(pet);
        await context.SaveChangesAsync();

        var handler = new CreateWeightRecordCommandHandler(context);
        var command = new CreateWeightRecordCommand(10.0, DateTime.UtcNow, 2);

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
    public async Task GetWeightHistory_ShouldReturnHistorySortedDescending()
    {
        // Arrange
        using var context = CreateDbContext();
        var records = new[]
        {
            new RegistroPeso { Id = 1, MascotaId = 1, PesoKg = 5.0, FechaRegistro = DateTime.UtcNow.AddDays(-2) },
            new RegistroPeso { Id = 2, MascotaId = 1, PesoKg = 6.0, FechaRegistro = DateTime.UtcNow },
            new RegistroPeso { Id = 3, MascotaId = 2, PesoKg = 15.0, FechaRegistro = DateTime.UtcNow.AddDays(-1) }
        };
        context.Pesos.AddRange(records);
        await context.SaveChangesAsync();

        var handler = new GetWeightHistoryQueryHandler(context);
        var query = new GetWeightHistoryQuery(1);

        // Act
        var result = (await handler.Handle(query, CancellationToken.None)).ToList();

        // Assert
        Assert.AreEqual(2, result.Count);
        Assert.AreEqual(2, result[0].Id); // Most recent first
        Assert.AreEqual(1, result[1].Id);
        Assert.IsTrue(result.All(r => r.MascotaId == 1));
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Mascotas.Commands;
using PetClinic.Application.Tareas.Commands;
using PetClinic.Application.Hospitalizaciones.Commands;
using PetClinic.Domain.Entities;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class FichaClinicaTests : TestBase
{
    [TestMethod]
    public async Task Handle_ShouldCreateWeightRecord_WhenPetIsActive()
    {
        // Arrange
        using var context = CreateDbContext();

        var mascota = new Mascota
        {
            Id = 1,
            Nombre = "Toby",
            Activo = true
        };
        context.Mascotas.Add(mascota);
        await context.SaveChangesAsync();

        var handler = new CreateWeightRecordCommandHandler(context);
        var command = new CreateWeightRecordCommand(12.5, DateTime.UtcNow, 1);

        // Act
        var recordId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(recordId > 0);
        var recordSaved = await context.Pesos.FindAsync(recordId);
        Assert.IsNotNull(recordSaved);
        Assert.AreEqual(12.5, recordSaved.PesoKg);
    }

    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenPetIsInactive()
    {
        // Arrange
        using var context = CreateDbContext();

        var mascota = new Mascota
        {
            Id = 2,
            Nombre = "Luna Inactiva",
            Activo = false
        };
        context.Mascotas.Add(mascota);
        await context.SaveChangesAsync();

        var handler = new CreateWeightRecordCommandHandler(context);
        var command = new CreateWeightRecordCommand(10.0, DateTime.UtcNow, 2);

        // Act & Assert
        bool threw = false;
        try
        {
            await handler.Handle(command, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("inactiva"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción si la mascota está inactiva.");
    }

    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenUpdatingTaskToInvalidStatus()
    {
        // Arrange
        using var context = CreateDbContext();

        var tarea = new TareaClinica
        {
            Id = 1,
            Titulo = "Dar medicina",
            Estado = "Pendiente"
        };
        context.TareasClinicas.Add(tarea);
        await context.SaveChangesAsync();

        var handler = new UpdateClinicalTaskStatusCommandHandler(context);
        var command = new UpdateClinicalTaskStatusCommand(1, "EstadoInvalidoQueNoExiste");

        // Act & Assert
        bool threw = false;
        try
        {
            await handler.Handle(command, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("no válido"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción si el estado de la tarea no es válido.");
    }

    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenRegisteringMonitoringForDischargedPatient()
    {
        // Arrange
        using var context = CreateDbContext();

        var hosp = new Hospitalizacion
        {
            Id = 1,
            MascotaId = 1,
            NumeroJaula = "Jaula 1",
            Estado = "Alta",
            FechaIngreso = DateTime.UtcNow.AddDays(-2),
            FechaAlta = DateTime.UtcNow
        };
        context.Hospitalizaciones.Add(hosp);
        await context.SaveChangesAsync();

        var handler = new CreateMonitoringRecordCommandHandler(context);
        var command = new CreateMonitoringRecordCommand(
            HospitalizacionId: 1,
            FrecuenciaCardiaca: 80,
            FrecuenciaRespiratoria: 20,
            Temperatura: 38.5m,
            EstadoAlerta: "Alerta",
            MedicamentosAdministrados: "Ninguno",
            NotasMonitoreo: "Paciente dado de alta",
            RegistradoPor: "Dra. Gomez"
        );

        // Act & Assert
        bool threw = false;
        try
        {
            await handler.Handle(command, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("dado de alta"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción si la hospitalización ya tiene estado de Alta.");
    }
}

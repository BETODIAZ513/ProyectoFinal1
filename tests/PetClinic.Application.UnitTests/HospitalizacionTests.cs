using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Hospitalizaciones.Commands;
using PetClinic.Application.Tareas.Commands;
using PetClinic.Domain.Entities;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class HospitalizacionTests : TestBase
{
    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenCageIsOccupied()
    {
        // Arrange
        using var context = CreateDbContext();

        var mascota1 = new Mascota
        {
            Id = 1,
            Nombre = "Rex",
            Especie = "Perro",
            Raza = "Golden",
            FechaNacimiento = DateTime.UtcNow.AddYears(-3),
            Sexo = "Macho",
            Activo = true,
            PropietarioId = 1
        };
        var mascota2 = new Mascota
        {
            Id = 2,
            Nombre = "Mimi",
            Especie = "Gato",
            Raza = "Persa",
            FechaNacimiento = DateTime.UtcNow.AddYears(-2),
            Sexo = "Hembra",
            Activo = true,
            PropietarioId = 1
        };
        context.Mascotas.Add(mascota1);
        context.Mascotas.Add(mascota2);

        var ingresoExistente = new Hospitalizacion
        {
            Id = 1,
            MascotaId = 1,
            Motivo = "Cirugía ósea",
            NumeroJaula = "J-10",
            FechaIngreso = DateTime.UtcNow,
            Estado = "Internado"
        };
        context.Hospitalizaciones.Add(ingresoExistente);

        await context.SaveChangesAsync();

        var handler = new AdmitPatientCommandHandler(context);

        // Act & Assert
        var commandOverlap = new AdmitPatientCommand(
            MascotaId: 2,
            Motivo: "Observación digestiva",
            NumeroJaula: "J-10"
        );

        bool threw = false;
        try
        {
            await handler.Handle(commandOverlap, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("ocupada"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción indicando que la jaula está ocupada.");
    }

    [TestMethod]
    public async Task Handle_ShouldCreateTaskInPendingState()
    {
        // Arrange
        using var context = CreateDbContext();

        var mascota = new Mascota
        {
            Id = 3,
            Nombre = "Bobby",
            Especie = "Perro",
            Raza = "Beagle",
            FechaNacimiento = DateTime.UtcNow.AddYears(-4),
            Sexo = "Macho",
            Activo = true,
            PropietarioId = 1
        };
        context.Mascotas.Add(mascota);

        var vet = new Veterinario
        {
            Id = 3,
            NombreCompleto = "Dr. Torres",
            Especialidad = "Cirugía",
            NumeroColegiatura = "VET789",
            Telefono = "555555",
            CorreoElectronico = "torres@clinic.com",
            Activo = true,
            ApplicationUserId = "User_Vet_Torres"
        };
        context.Veterinarios.Add(vet);

        await context.SaveChangesAsync();

        var handler = new CreateClinicalTaskCommandHandler(context);
        var command = new CreateClinicalTaskCommand(
            Titulo: "Limpieza de herida",
            Descripcion: "Limpiar y aplicar antiséptico cada 8 horas",
            MascotaId: 3,
            VeterinarioApplicationUserId: "User_Vet_Torres",
            CitaId: null
        );

        // Act
        var taskId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(taskId > 0);
        var taskSaved = await context.TareasClinicas.FindAsync(taskId);
        Assert.IsNotNull(taskSaved);
        Assert.AreEqual("Limpieza de herida", taskSaved.Titulo);
        Assert.AreEqual("Pendiente", taskSaved.Estado);
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Citas.Commands;
using PetClinic.Application.Consultas.Commands;
using PetClinic.Domain.Entities;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class CitaTests : TestBase
{
    [TestMethod]
    public async Task Handle_ShouldThrowException_WhenAppointmentOverlaps()
    {
        // Arrange
        using var context = CreateDbContext();

        var mascota = new Mascota
        {
            Id = 1,
            Nombre = "Toby",
            Especie = "Perro",
            Raza = "Criollo",
            FechaNacimiento = DateTime.UtcNow.AddYears(-2),
            Sexo = "Macho",
            Activo = true,
            PropietarioId = 1
        };
        context.Mascotas.Add(mascota);

        var vet = new Veterinario
        {
            Id = 1,
            NombreCompleto = "Dr. Perez",
            Especialidad = "General",
            NumeroColegiatura = "VET123",
            Telefono = "123456",
            CorreoElectronico = "perez@clinic.com",
            Activo = true
        };
        context.Veterinarios.Add(vet);

        var citaExistente = new Cita
        {
            Id = 1,
            MascotaId = 1,
            VeterinarioId = 1,
            FechaHora = new DateTime(2026, 7, 9, 10, 0, 0, DateTimeKind.Utc),
            Motivo = "Consulta general",
            Estado = "Agendada"
        };
        context.Citas.Add(citaExistente);

        await context.SaveChangesAsync();

        var handler = new CreateAppointmentCommandHandler(context);

        // Act & Assert
        var commandOverlapping = new CreateAppointmentCommand(
            MascotaId: 1,
            VeterinarioId: 1,
            FechaHora: new DateTime(2026, 7, 9, 10, 15, 0, DateTimeKind.Utc),
            Motivo: "Consulta de control"
        );

        bool threw = false;
        try
        {
            await handler.Handle(commandOverlapping, CancellationToken.None);
        }
        catch (Exception ex) when (ex.Message.Contains("rango horario"))
        {
            threw = true;
        }

        Assert.IsTrue(threw, "Debería lanzar excepción de solapamiento de horario.");
    }

    [TestMethod]
    public async Task Handle_ShouldCompleteAppointment_WhenClosingConsultation()
    {
        // Arrange
        using var context = CreateDbContext();

        var mascota = new Mascota
        {
            Id = 2,
            Nombre = "Luna",
            Especie = "Gato",
            Raza = "Mestizo",
            FechaNacimiento = DateTime.UtcNow.AddYears(-1),
            Sexo = "Hembra",
            Activo = true,
            PropietarioId = 1
        };
        context.Mascotas.Add(mascota);

        var vet = new Veterinario
        {
            Id = 2,
            NombreCompleto = "Dra. Gomez",
            Especialidad = "Felinos",
            NumeroColegiatura = "VET456",
            Telefono = "654321",
            CorreoElectronico = "gomez@clinic.com",
            Activo = true
        };
        context.Veterinarios.Add(vet);

        var cita = new Cita
        {
            Id = 2,
            MascotaId = 2,
            VeterinarioId = 2,
            FechaHora = DateTime.UtcNow,
            Motivo = "Dolor de estómago",
            Estado = "Agendada"
        };
        context.Citas.Add(cita);

        await context.SaveChangesAsync();

        var handler = new CreateConsultationDetailCommandHandler(context);
        var command = new CreateConsultationDetailCommand(
            CitaId: 2,
            MascotaId: 2,
            VeterinarioId: 2,
            Diagnostico: "Gastritis leve",
            Tratamiento: "Ayuno de 12 horas y analgésico",
            NotasAdicionales: "Monitorear vómitos"
        );

        // Act
        var detailId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(detailId > 0);
        var updatedCita = await context.Citas.FindAsync(2);
        Assert.IsNotNull(updatedCita);
        Assert.AreEqual("Completada", updatedCita.Estado);

        var detalleSaved = await context.DetallesConsultas.FindAsync(detailId);
        Assert.IsNotNull(detalleSaved);
        Assert.AreEqual("Gastritis leve", detalleSaved.Diagnostico);
    }
}

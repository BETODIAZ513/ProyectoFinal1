using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Consultas.Queries;
using PetClinic.Application.Hospitalizaciones.Queries;
using PetClinic.Domain.Entities;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class QueriesTests : TestBase
{
    [TestMethod]
    public async Task Handle_ShouldReturnOnlySpecificPetClinicalHistory_SortedDescending()
    {
        // Arrange
        using var context = CreateDbContext();

        var vet = new Veterinario { Id = 1, NombreCompleto = "Dr. Perez", Activo = true };
        context.Veterinarios.Add(vet);

        var details = new[]
        {
            new DetalleConsulta
            {
                Id = 1, CitaId = 1, MascotaId = 10, VeterinarioId = 1,
                FechaAtencion = DateTime.UtcNow.AddDays(-2), Diagnostico = "Gripe", Tratamiento = "Reposo"
            },
            new DetalleConsulta
            {
                Id = 2, CitaId = 2, MascotaId = 10, VeterinarioId = 1,
                FechaAtencion = DateTime.UtcNow, Diagnostico = "Sano", Tratamiento = "Ninguno"
            },
            new DetalleConsulta
            {
                Id = 3, CitaId = 3, MascotaId = 20, VeterinarioId = 1,
                FechaAtencion = DateTime.UtcNow.AddDays(-1), Diagnostico = "Fractura", Tratamiento = "Yeso"
            }
        };
        context.DetallesConsultas.AddRange(details);
        await context.SaveChangesAsync();

        var handler = new GetClinicalHistoryQueryHandler(context);
        var query = new GetClinicalHistoryQuery(10);

        // Act
        var result = (await handler.Handle(query, CancellationToken.None)).ToList();

        // Assert
        Assert.AreEqual(2, result.Count);
        Assert.AreEqual(2, result[0].Id); // El más reciente (FechaAtencion actual) debe ir primero
        Assert.AreEqual(1, result[1].Id); // El más antiguo debe ir después
        Assert.IsTrue(result.All(d => d.MascotaId == 10));
    }

    [TestMethod]
    public async Task Handle_ShouldReturnOnlyActiveHospitalizedPatients_SortedByCage()
    {
        // Arrange
        using var context = CreateDbContext();

        var pets = new[]
        {
            new Mascota { Id = 1, Nombre = "Pet A", Activo = true },
            new Mascota { Id = 2, Nombre = "Pet B", Activo = true }
        };
        context.Mascotas.AddRange(pets);

        var hospitalizations = new[]
        {
            new Hospitalizacion { Id = 1, MascotaId = 1, NumeroJaula = "Jaula B", Estado = "Internado", FechaIngreso = DateTime.UtcNow },
            new Hospitalizacion { Id = 2, MascotaId = 2, NumeroJaula = "Jaula A", Estado = "Internado", FechaIngreso = DateTime.UtcNow },
            new Hospitalizacion { Id = 3, MascotaId = 1, NumeroJaula = "Jaula C", Estado = "Alta", FechaIngreso = DateTime.UtcNow }
        };
        context.Hospitalizaciones.AddRange(hospitalizations);
        await context.SaveChangesAsync();

        var handler = new GetHospitalizedPatientsQueryHandler(context);
        var query = new GetHospitalizedPatientsQuery();

        // Act
        var result = (await handler.Handle(query, CancellationToken.None)).ToList();

        // Assert
        Assert.AreEqual(2, result.Count);
        Assert.AreEqual("Jaula A", result[0].NumeroJaula); // Ordenación por jaula ascendente
        Assert.AreEqual("Jaula B", result[1].NumeroJaula);
        Assert.IsTrue(result.All(h => h.Estado == "Internado"));
    }
}

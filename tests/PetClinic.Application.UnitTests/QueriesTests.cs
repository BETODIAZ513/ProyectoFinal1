using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Consultas.Queries;
using PetClinic.Application.Hospitalizaciones.Queries;
using PetClinic.Application.Propietarios.Queries;
using PetClinic.Application.Mascotas.Queries;
using PetClinic.Application.Citas.Queries;
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

    [TestMethod]
    public async Task GetOwnerById_ShouldReturnOwner_WhenIdExists()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario { Id = 3, NombreCompleto = "Owner Three", Telefono = "123", CorreoElectronico = "three@owner.com", Activo = true };
        context.Propietarios.Add(owner);
        await context.SaveChangesAsync();

        var handler = new GetOwnerByIdQueryHandler(context);
        var query = new GetOwnerByIdQuery(3);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual("Owner Three", result.NombreCompleto);
    }

    [TestMethod]
    public async Task GetOwnersPaged_ShouldReturnPagedListFilteredAndSorted()
    {
        // Arrange
        using var context = CreateDbContext();
        var owners = new[]
        {
            new Propietario { Id = 1, NombreCompleto = "Zoe Smith", Telefono = "111", CorreoElectronico = "zoe@owner.com", Activo = true },
            new Propietario { Id = 2, NombreCompleto = "Abel Adams", Telefono = "222", CorreoElectronico = "abel@owner.com", Activo = true },
            new Propietario { Id = 3, NombreCompleto = "John Doe", Telefono = "333", CorreoElectronico = "john@owner.com", Activo = true }
        };
        context.Propietarios.AddRange(owners);
        await context.SaveChangesAsync();

        var handler = new GetOwnersPagedQueryHandler(context);

        // Act (Search term 'smith')
        var resultSearch = await handler.Handle(new GetOwnersPagedQuery("smith", 1, 10), CancellationToken.None);
        // Act (All paged, sorted alphabetically)
        var resultAll = await handler.Handle(new GetOwnersPagedQuery(null, 1, 2), CancellationToken.None);

        // Assert search
        Assert.AreEqual(1, resultSearch.TotalCount);
        Assert.AreEqual("Zoe Smith", resultSearch.Items.ToList()[0].NombreCompleto);

        // Assert paging and sorting
        Assert.AreEqual(3, resultAll.TotalCount);
        Assert.AreEqual(2, resultAll.Items.Count());
        Assert.AreEqual("Abel Adams", resultAll.Items.ToList()[0].NombreCompleto); // A comes first
        Assert.AreEqual("John Doe", resultAll.Items.ToList()[1].NombreCompleto);
    }

    [TestMethod]
    public async Task GetPetById_ShouldReturnPetDto_WhenIdExists()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario { Id = 1, NombreCompleto = "Owner One", Activo = true };
        var pet = new Mascota { Id = 10, Nombre = "Skippy", PropietarioId = 1, Activo = true };
        context.Propietarios.Add(owner);
        context.Mascotas.Add(pet);
        await context.SaveChangesAsync();

        var handler = new GetPetByIdQueryHandler(context);
        var query = new GetPetByIdQuery(10);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual("Skippy", result.Nombre);
        Assert.AreEqual("Owner One", result.PropietarioNombreCompleto);
    }

    [TestMethod]
    public async Task GetPetsPaged_ShouldReturnPagedPetsFilteredAndSorted()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario { Id = 1, NombreCompleto = "Owner One", Activo = true };
        var pets = new[]
        {
            new Mascota { Id = 1, Nombre = "Rocky", PropietarioId = 1, Activo = true },
            new Mascota { Id = 2, Nombre = "Coco", PropietarioId = 1, Activo = true }
        };
        context.Propietarios.Add(owner);
        context.Mascotas.AddRange(pets);
        await context.SaveChangesAsync();

        var handler = new GetPetsPagedQueryHandler(context);

        // Act
        var result = await handler.Handle(new GetPetsPagedQuery(null, 1, 10), CancellationToken.None);

        // Assert
        Assert.AreEqual(2, result.TotalCount);
        Assert.AreEqual("Coco", result.Items.ToList()[0].Nombre); // Alphabetical C before R
        Assert.AreEqual("Rocky", result.Items.ToList()[1].Nombre);
    }

    [TestMethod]
    public async Task GetAppointmentsPaged_ShouldReturnPagedAppointmentsOrderedByDateDescending()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario { Id = 1, NombreCompleto = "Owner", Activo = true };
        var pet = new Mascota { Id = 1, Nombre = "Pet", PropietarioId = 1, Activo = true };
        var vet = new Veterinario { Id = 1, NombreCompleto = "Vet", Activo = true };
        context.Propietarios.Add(owner);
        context.Mascotas.Add(pet);
        context.Veterinarios.Add(vet);

        var appointments = new[]
        {
            new Cita { Id = 1, MascotaId = 1, VeterinarioId = 1, FechaHora = DateTime.UtcNow.AddDays(-1), Motivo = "Checkup 1", Estado = "Programada" },
            new Cita { Id = 2, MascotaId = 1, VeterinarioId = 1, FechaHora = DateTime.UtcNow, Motivo = "Checkup 2", Estado = "Programada" }
        };
        context.Citas.AddRange(appointments);
        await context.SaveChangesAsync();

        var handler = new GetAppointmentsPagedQueryHandler(context);

        // Act
        var result = await handler.Handle(new GetAppointmentsPagedQuery(1, 10), CancellationToken.None);

        // Assert
        Assert.AreEqual(2, result.TotalCount);
        Assert.AreEqual(2, result.Items.ToList()[0].Id); // Most recent first
        Assert.AreEqual(1, result.Items.ToList()[1].Id);
    }

    [TestMethod]
    public async Task GetTodayAppointments_ShouldReturnOnlyTodayAppointments()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario { Id = 1, NombreCompleto = "Owner", Activo = true };
        var pet = new Mascota { Id = 1, Nombre = "Pet", PropietarioId = 1, Activo = true };
        var vet = new Veterinario { Id = 1, NombreCompleto = "Vet", Activo = true };
        context.Propietarios.Add(owner);
        context.Mascotas.Add(pet);
        context.Veterinarios.Add(vet);

        var appointments = new[]
        {
            new Cita { Id = 1, MascotaId = 1, VeterinarioId = 1, FechaHora = DateTime.Today.AddHours(10), Motivo = "Today", Estado = "Programada" },
            new Cita { Id = 2, MascotaId = 1, VeterinarioId = 1, FechaHora = DateTime.Today.AddDays(-1).AddHours(10), Motivo = "Yesterday", Estado = "Programada" },
            new Cita { Id = 3, MascotaId = 1, VeterinarioId = 1, FechaHora = DateTime.Today.AddDays(1).AddHours(10), Motivo = "Tomorrow", Estado = "Programada" }
        };
        context.Citas.AddRange(appointments);
        await context.SaveChangesAsync();

        var handler = new GetTodayAppointmentsQueryHandler(context);

        // Act
        var result = (await handler.Handle(new GetTodayAppointmentsQuery(), CancellationToken.None)).ToList();

        // Assert
        Assert.AreEqual(1, result.Count);
        Assert.AreEqual("Today", result[0].Motivo);
    }

    [TestMethod]
    public async Task GetAppointmentsHistory_ShouldReturnOnlyCompletedOrCanceledAppointments()
    {
        // Arrange
        using var context = CreateDbContext();
        var owner = new Propietario { Id = 1, NombreCompleto = "Owner", Activo = true };
        var pet = new Mascota { Id = 1, Nombre = "Pet", PropietarioId = 1, Activo = true };
        var vet = new Veterinario { Id = 1, NombreCompleto = "Vet", Activo = true };
        context.Propietarios.Add(owner);
        context.Mascotas.Add(pet);
        context.Veterinarios.Add(vet);

        var appointments = new[]
        {
            new Cita { Id = 1, MascotaId = 1, VeterinarioId = 1, FechaHora = DateTime.UtcNow, Motivo = "Completed", Estado = "Completada" },
            new Cita { Id = 2, MascotaId = 1, VeterinarioId = 1, FechaHora = DateTime.UtcNow, Motivo = "Canceled", Estado = "Cancelada" },
            new Cita { Id = 3, MascotaId = 1, VeterinarioId = 1, FechaHora = DateTime.UtcNow, Motivo = "Active", Estado = "Programada" }
        };
        context.Citas.AddRange(appointments);
        await context.SaveChangesAsync();

        var handler = new GetAppointmentsHistoryQueryHandler(context);

        // Act
        var result = await handler.Handle(new GetAppointmentsHistoryQuery(1, 10), CancellationToken.None);

        // Assert
        Assert.AreEqual(2, result.TotalCount);
        Assert.IsTrue(result.Items.All(c => c.Estado == "Completada" || c.Estado == "Cancelada"));
    }

    [TestMethod]
    public async Task GetMonitoringHistory_ShouldReturnRecordsForSpecificHospitalizationSorted()
    {
        // Arrange
        using var context = CreateDbContext();
        var records = new[]
        {
            new MonitoreoClinico { Id = 1, HospitalizacionId = 5, FechaHora = DateTime.UtcNow.AddHours(-1), Temperatura = 38.5M, RegistradoPor = "Aux" },
            new MonitoreoClinico { Id = 2, HospitalizacionId = 5, FechaHora = DateTime.UtcNow, Temperatura = 39.0M, RegistradoPor = "Aux" },
            new MonitoreoClinico { Id = 3, HospitalizacionId = 10, FechaHora = DateTime.UtcNow, Temperatura = 37.0M, RegistradoPor = "Aux" }
        };
        context.MonitoreosClinicos.AddRange(records);
        await context.SaveChangesAsync();

        var handler = new GetMonitoringHistoryQueryHandler(context);
        var query = new GetMonitoringHistoryQuery(5);

        // Act
        var result = (await handler.Handle(query, CancellationToken.None)).ToList();

        // Assert
        Assert.AreEqual(2, result.Count);
        Assert.AreEqual(2, result[0].Id); // Most recent first
        Assert.AreEqual(1, result[1].Id);
        Assert.IsTrue(result.All(m => m.HospitalizacionId == 5));
     }

    [TestMethod]
    public async Task GetPetsForPortal_ShouldReturnOnlyActivePetsOfSpecificPropietario()
    {
        // Arrange
        using var context = CreateDbContext();
        var owners = new[]
        {
            new Propietario { Id = 1, NombreCompleto = "Owner One", Activo = true },
            new Propietario { Id = 2, NombreCompleto = "Owner Two", Activo = true }
        };
        context.Propietarios.AddRange(owners);

        var pets = new[]
        {
            new Mascota { Id = 10, Nombre = "Zelda", PropietarioId = 1, Activo = true },
            new Mascota { Id = 20, Nombre = "Coco", PropietarioId = 1, Activo = true },
            new Mascota { Id = 30, Nombre = "Rocky", PropietarioId = 1, Activo = false }, // Inactiva
            new Mascota { Id = 40, Nombre = "Luna", PropietarioId = 2, Activo = true } // De otro dueño
        };
        context.Mascotas.AddRange(pets);
        await context.SaveChangesAsync();

        var handler = new GetPetsForPortalQueryHandler(context);
        var query = new GetPetsForPortalQuery(1);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.AreEqual(2, result.Count);
        Assert.AreEqual("Coco", result[0].Nombre); // Ordenado alfabéticamente
        Assert.AreEqual("Zelda", result[1].Nombre);
    }

    [TestMethod]
    public async Task GetActiveHospitalizationByPet_ShouldReturnActiveHospitalizationForPet()
    {
        // Arrange
        using var context = CreateDbContext();
        var pet = new Mascota { Id = 5, Nombre = "Sparky", Activo = true };
        context.Mascotas.Add(pet);

        var hospitalizations = new[]
        {
            new Hospitalizacion { Id = 1, MascotaId = 5, Estado = "Alta", FechaIngreso = DateTime.UtcNow.AddDays(-5), FechaAlta = DateTime.UtcNow.AddDays(-3), NumeroJaula = "Jaula 1" },
            new Hospitalizacion { Id = 2, MascotaId = 5, Estado = "Internado", FechaIngreso = DateTime.UtcNow, NumeroJaula = "Jaula 2" }
        };
        context.Hospitalizaciones.AddRange(hospitalizations);
        await context.SaveChangesAsync();

        var handler = new GetActiveHospitalizationByPetQueryHandler(context);
        var query = new GetActiveHospitalizationByPetQuery(5);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(2, result.Id);
        Assert.AreEqual("Internado", result.Estado);
        Assert.AreEqual("Jaula 2", result.NumeroJaula);
    }
}

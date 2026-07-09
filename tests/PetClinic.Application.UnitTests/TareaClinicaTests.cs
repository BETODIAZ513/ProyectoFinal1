using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Tareas.Commands;
using PetClinic.Application.Tareas.Queries;
using PetClinic.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class TareaClinicaTests : TestBase
{
    [TestMethod]
    public async Task CreateClinicalTask_ShouldSaveTask_WhenPetAndVetAreActive()
    {
        // Arrange
        using var context = CreateDbContext();
        var pet = new Mascota { Id = 1, Nombre = "Lassie", Activo = true };
        var vet = new Veterinario { Id = 1, NombreCompleto = "Dr. House", ApplicationUserId = "User_123", Activo = true };
        context.Mascotas.Add(pet);
        context.Veterinarios.Add(vet);
        await context.SaveChangesAsync();

        var handler = new CreateClinicalTaskCommandHandler(context);
        var command = new CreateClinicalTaskCommand("Administrar Suero", "500ml", 1, "User_123", null);

        // Act
        var resultId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(resultId > 0);
        var savedTask = await context.TareasClinicas.FindAsync(resultId);
        Assert.IsNotNull(savedTask);
        Assert.AreEqual("Administrar Suero", savedTask.Titulo);
        Assert.AreEqual("Pendiente", savedTask.Estado);
    }

    [TestMethod]
    public async Task CreateClinicalTask_ShouldThrowException_WhenPetIsInactive()
    {
        // Arrange
        using var context = CreateDbContext();
        var pet = new Mascota { Id = 2, Nombre = "Inactiva", Activo = false };
        var vet = new Veterinario { Id = 1, NombreCompleto = "Dr. House", ApplicationUserId = "User_123", Activo = true };
        context.Mascotas.Add(pet);
        context.Veterinarios.Add(vet);
        await context.SaveChangesAsync();

        var handler = new CreateClinicalTaskCommandHandler(context);
        var command = new CreateClinicalTaskCommand("Task", "Desc", 2, "User_123", null);

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
    public async Task CreateClinicalTask_ShouldThrowException_WhenVetProfileDoesNotExist()
    {
        // Arrange
        using var context = CreateDbContext();
        var pet = new Mascota { Id = 1, Nombre = "Lassie", Activo = true };
        context.Mascotas.Add(pet);
        await context.SaveChangesAsync();

        var handler = new CreateClinicalTaskCommandHandler(context);
        var command = new CreateClinicalTaskCommand("Task", "Desc", 1, "Missing_User", null);

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
    public async Task UpdateClinicalTaskStatus_ShouldUpdateState_WhenTaskExistsAndStateIsValid()
    {
        // Arrange
        using var context = CreateDbContext();
        var task = new TareaClinica { Id = 1, Titulo = "Task 1", Estado = "Pendiente", MascotaId = 1, VeterinarioId = 1 };
        context.TareasClinicas.Add(task);
        await context.SaveChangesAsync();

        var handler = new UpdateClinicalTaskStatusCommandHandler(context);
        var command = new UpdateClinicalTaskStatusCommand(1, "En Progreso");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.IsTrue(result);
        var updatedTask = await context.TareasClinicas.FindAsync(1);
        Assert.IsNotNull(updatedTask);
        Assert.AreEqual("En Progreso", updatedTask.Estado);
    }

    [TestMethod]
    public async Task UpdateClinicalTaskStatus_ShouldThrowException_WhenStateIsInvalid()
    {
        // Arrange
        using var context = CreateDbContext();
        var task = new TareaClinica { Id = 1, Titulo = "Task 1", Estado = "Pendiente", MascotaId = 1, VeterinarioId = 1 };
        context.TareasClinicas.Add(task);
        await context.SaveChangesAsync();

        var handler = new UpdateClinicalTaskStatusCommandHandler(context);
        var command = new UpdateClinicalTaskStatusCommand(1, "EstadoInexistente");

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
    public async Task GetClinicalTasks_ShouldReturnMappedTasks()
    {
        // Arrange
        using var context = CreateDbContext();
        var pet = new Mascota { Id = 1, Nombre = "Lassie", Activo = true };
        var vet = new Veterinario { Id = 1, NombreCompleto = "Dr. House", ApplicationUserId = "User_123", Activo = true };
        var task = new TareaClinica { Id = 1, Titulo = "Task 1", Estado = "Pendiente", MascotaId = 1, VeterinarioId = 1 };
        
        context.Mascotas.Add(pet);
        context.Veterinarios.Add(vet);
        context.TareasClinicas.Add(task);
        await context.SaveChangesAsync();

        var handler = new GetClinicalTasksQueryHandler(context);
        var query = new GetClinicalTasksQuery();

        // Act
        var result = (await handler.Handle(query, CancellationToken.None)).ToList();

        // Assert
        Assert.AreEqual(1, result.Count);
        Assert.AreEqual("Task 1", result[0].Titulo);
        Assert.AreEqual("Lassie", result[0].MascotaNombre);
        Assert.AreEqual("Dr. House", result[0].VeterinarioNombre);
    }

    [TestMethod]
    public async Task GetPredefinedTasks_ShouldReturnListOrderedByName()
    {
        // Arrange
        using var context = CreateDbContext();
        var tasks = new[]
        {
            new TareaPredefinida { Id = 1, Nombre = "Control de Temperatura", Descripcion = "Medir temp" },
            new TareaPredefinida { Id = 2, Nombre = "Administración de Medicamentos", Descripcion = "Dar dosis" }
        };
        context.TareasPredefinidas.AddRange(tasks);
        await context.SaveChangesAsync();

        var handler = new GetPredefinedTasksQueryHandler(context);
        var query = new GetPredefinedTasksQuery();

        // Act
        var result = (await handler.Handle(query, CancellationToken.None)).ToList();

        // Assert
        Assert.AreEqual(2, result.Count);
        Assert.AreEqual("Administración de Medicamentos", result[0].Nombre); // Alphabetical sorting
        Assert.AreEqual("Control de Temperatura", result[1].Nombre);
    }
}

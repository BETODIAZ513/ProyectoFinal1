using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Domain.Entities;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class AuditoriaTests : TestBase
{
    [TestMethod]
    public async Task Verify_AuditingShadowProperties_ForCoreEntities()
    {
        // Arrange
        using var context = CreateDbContext();

        var vet = new Veterinario
        {
            NombreCompleto = "Dr. Perez Auditoria",
            Especialidad = "General",
            NumeroColegiatura = "VETAUD",
            Telefono = "123",
            CorreoElectronico = "aud@clinic.com",
            Activo = true
        };

        // Act
        context.Veterinarios.Add(vet);
        await context.SaveChangesAsync();

        // Assert
        var entry = context.Entry(vet);
        
        var createdBy = entry.Property("CreatedBy").CurrentValue as string;
        var createdAt = entry.Property("CreatedAt").CurrentValue as DateTime?;

        Assert.AreEqual("TestUser", createdBy);
        Assert.IsNotNull(createdAt);
        Assert.IsTrue(createdAt.Value > DateTime.UtcNow.AddMinutes(-1));
    }

    [TestMethod]
    public async Task Verify_AuditingPropertiesExcluded_ForPredefinedTasksAndWeightLogs()
    {
        // Arrange
        using var context = CreateDbContext();

        var taskTemplate = new TareaPredefinida
        {
            Nombre = "Medicamento",
            Descripcion = "Administración de fármacos"
        };

        var weightRecord = new RegistroPeso
        {
            PesoKg = 15.5,
            FechaRegistro = DateTime.UtcNow,
            MascotaId = 1
        };

        // Act
        context.TareasPredefinidas.Add(taskTemplate);
        context.Pesos.Add(weightRecord);
        await context.SaveChangesAsync();

        // Assert
        var taskEntry = context.Entry(taskTemplate);
        var weightEntry = context.Entry(weightRecord);

        var taskHasCreatedBy = taskEntry.Metadata.FindProperty("CreatedBy") != null;
        var taskHasCreatedAt = taskEntry.Metadata.FindProperty("CreatedAt") != null;

        var weightHasCreatedBy = weightEntry.Metadata.FindProperty("CreatedBy") != null;
        var weightHasCreatedAt = weightEntry.Metadata.FindProperty("CreatedAt") != null;

        Assert.IsFalse(taskHasCreatedBy, "TareaPredefinida should not contain CreatedBy property");
        Assert.IsFalse(taskHasCreatedAt, "TareaPredefinida should not contain CreatedAt property");

        Assert.IsFalse(weightHasCreatedBy, "RegistroPeso should not contain CreatedBy property");
        Assert.IsFalse(weightHasCreatedAt, "RegistroPeso should not contain CreatedAt property");
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Domain.Entities;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PetClinic.IntegrationTests;

[TestClass]
public class VeterinarioIntegrationTests : IntegrationTestBase
{
    [TestMethod]
    public async Task GetAll_WhenAuthenticated_ReturnsVeterinarians()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");

        // Act
        var response = await Client.GetAsync("api/veterinarios");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var list = await response.Content.ReadFromJsonAsync<List<Veterinario>>();
        Assert.IsNotNull(list);
        Assert.AreEqual(8, list.Count); // 8 vets seeded in DbInitializer
    }

    [TestMethod]
    public async Task Create_AsAdmin_AddsVeterinarianAndIdentityUser()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var payload = new
        {
            NombreCompleto = "Dr. Carlos Delgado",
            Especialidad = "Neurología",
            NumeroColegiatura = "VET8888",
            Telefono = "999999999",
            CorreoElectronico = "carlos.delgado@petclinic.com",
            Password = "SecurePass123!"
        };

        // Act
        var response = await Client.PostAsJsonAsync("api/veterinarios", payload);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var vetId = await response.Content.ReadFromJsonAsync<int>();
        Assert.IsTrue(vetId > 0);

        // Verify in DB directly
        var vetInDb = await DbContext.Veterinarios.FirstOrDefaultAsync(v => v.Id == vetId);
        Assert.IsNotNull(vetInDb);
        Assert.AreEqual("Dr. Carlos Delgado", vetInDb.NombreCompleto);
        Assert.AreEqual("Neurología", vetInDb.Especialidad);
        Assert.IsNotNull(vetInDb.ApplicationUserId);

        // Verify user in Identity is created and active
        var userInDb = await DbContext.Users.FirstOrDefaultAsync(u => u.Email == "carlos.delgado@petclinic.com");
        Assert.IsNotNull(userInDb);
        Assert.IsTrue(userInDb.Activo);
    }

    [TestMethod]
    public async Task Update_AsAdmin_ModifiesVeterinarian()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        
        // Fetch first vet in Db
        var firstVet = await DbContext.Veterinarios.FirstAsync();
        var payload = new
        {
            Id = firstVet.Id,
            NombreCompleto = "Dr. Roberto Gomez Editado",
            Especialidad = "Traumatología",
            NumeroColegiatura = firstVet.NumeroColegiatura,
            Telefono = "911111111",
            CorreoElectronico = firstVet.CorreoElectronico
        };

        // Act
        var response = await Client.PutAsJsonAsync($"api/veterinarios/{firstVet.Id}", payload);

        // Assert
        Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);

        // Verify in DB directly
        // Detach the entity to prevent EF Core from using cached entity in verification
        DbContext.Entry(firstVet).State = EntityState.Detached;
        var updatedVet = await DbContext.Veterinarios.FindAsync(firstVet.Id);
        Assert.IsNotNull(updatedVet);
        Assert.AreEqual("Dr. Roberto Gomez Editado", updatedVet.NombreCompleto);
        Assert.AreEqual("Traumatología", updatedVet.Especialidad);
    }

    [TestMethod]
    public async Task Delete_AsAdmin_SoftDeletesVeterinarian()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var firstVet = await DbContext.Veterinarios.FirstAsync();

        // Act
        var response = await Client.DeleteAsync($"api/veterinarios/{firstVet.Id}");

        // Assert
        Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);

        // Verify in DB directly
        DbContext.Entry(firstVet).State = EntityState.Detached;
        var deletedVet = await DbContext.Veterinarios.FindAsync(firstVet.Id);
        Assert.IsNotNull(deletedVet);
        Assert.IsFalse(deletedVet.Activo); // Soft delete active flag set to false

        // Verify the linked Identity user account is deactivated (REQ-VET-03)
        var userInDb = await DbContext.Users.FindAsync(deletedVet.ApplicationUserId);
        Assert.IsNotNull(userInDb);
        Assert.IsFalse(userInDb.Activo);
    }
}

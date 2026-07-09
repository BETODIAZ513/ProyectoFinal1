using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Domain.Entities;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PetClinic.IntegrationTests;

[TestClass]
public class PropietarioIntegrationTests : IntegrationTestBase
{
    [TestMethod]
    public async Task GetAll_AsUnauthenticated_ReturnsUnauthorized()
    {
        // Act
        var response = await Client.GetAsync("api/propietarios");

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task GetAll_AsNonAdmin_ReturnsForbidden()
    {
        // Arrange - Login as a veterinarian, which does not have the Admin/Receptionist roles
        await AuthenticateAsync("vet1@petclinic.com", "Admin123!");

        // Act
        var response = await Client.GetAsync("api/propietarios");

        // Assert
        Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [TestMethod]
    public async Task GetPaged_AsAdmin_ReturnsPagedList()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");

        // Act
        var response = await Client.GetAsync("api/propietarios?page=1&pageSize=5");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<PagedListDto<Propietario>>();
        Assert.IsNotNull(result);
        Assert.AreEqual(10, result.TotalCount); // 10 owners seeded
        Assert.AreEqual(5, result.Items.Count); // Page size is 5
    }

    [TestMethod]
    public async Task Create_AsAdmin_AddsOwnerToDb()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var payload = new
        {
            NombreCompleto = "Jose Gonzales",
            Telefono = "999888777",
            CorreoElectronico = "jose.gonzales@gmail.com",
            Direccion = "Av. Brasil 1234, Jesus Maria"
        };

        // Act
        var response = await Client.PostAsJsonAsync("api/propietarios", payload);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        var ownerId = await response.Content.ReadFromJsonAsync<int>();
        Assert.IsTrue(ownerId > 0);

        var ownerInDb = await DbContext.Propietarios.FindAsync(ownerId);
        Assert.IsNotNull(ownerInDb);
        Assert.AreEqual("Jose Gonzales", ownerInDb.NombreCompleto);
        Assert.IsTrue(ownerInDb.Activo);
    }

    [TestMethod]
    public async Task Update_AsAdmin_ModifiesOwner()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var owner = await DbContext.Propietarios.FirstAsync();
        var payload = new
        {
            Id = owner.Id,
            NombreCompleto = "Juan Perez Modificado",
            Telefono = "911222333",
            CorreoElectronico = "juan.perez.mod@gmail.com",
            Direccion = "Av. Benavides 1230, Miraflores"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"api/propietarios/{owner.Id}", payload);

        // Assert
        Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);

        DbContext.Entry(owner).State = EntityState.Detached;
        var updatedOwner = await DbContext.Propietarios.FindAsync(owner.Id);
        Assert.IsNotNull(updatedOwner);
        Assert.AreEqual("Juan Perez Modificado", updatedOwner.NombreCompleto);
        Assert.AreEqual("juan.perez.mod@gmail.com", updatedOwner.CorreoElectronico);
    }

    [TestMethod]
    public async Task Delete_AsAdmin_SoftDeletesOwner()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var owner = await DbContext.Propietarios.FirstAsync();

        // Act
        var response = await Client.DeleteAsync($"api/propietarios/{owner.Id}");

        // Assert
        Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);

        DbContext.Entry(owner).State = EntityState.Detached;
        var deletedOwner = await DbContext.Propietarios.FindAsync(owner.Id);
        Assert.IsNotNull(deletedOwner);
        Assert.IsFalse(deletedOwner.Activo); // Soft-deleted
    }

    private class PagedListDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
    }
}

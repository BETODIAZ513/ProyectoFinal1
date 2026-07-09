using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PetClinic.IntegrationTests;

[TestClass]
public class MascotaIntegrationTests : IntegrationTestBase
{
    [TestMethod]
    public async Task GetPaged_AsAuthenticated_ReturnsPagedPets()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");

        // Act
        var response = await Client.GetAsync("api/mascotas?page=1&pageSize=5");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<PagedListDto<MascotaDto>>();
        Assert.IsNotNull(result);
        Assert.AreEqual(15, result.TotalCount); // 15 pets seeded in DbInitializer
        Assert.AreEqual(5, result.Items.Count);
    }

    [TestMethod]
    public async Task Create_WithValidOwner_SavesPet()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var owner = await DbContext.Propietarios.FirstAsync();
        var payload = new
        {
            Nombre = "Sparky",
            Especie = "Perro",
            Raza = "Dálmata",
            FechaNacimiento = DateTime.Today.AddYears(-2),
            Sexo = "Macho",
            Color = "Blanco y Negro",
            PropietarioId = owner.Id
        };

        // Act
        var response = await Client.PostAsJsonAsync("api/mascotas", payload);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        var petId = await response.Content.ReadFromJsonAsync<int>();
        Assert.IsTrue(petId > 0);

        var petInDb = await DbContext.Mascotas.FindAsync(petId);
        Assert.IsNotNull(petInDb);
        Assert.AreEqual("Sparky", petInDb.Nombre);
        Assert.AreEqual(owner.Id, petInDb.PropietarioId);
    }

    [TestMethod]
    public async Task Create_WithInactiveOwner_ReturnsBadRequest()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var owner = await DbContext.Propietarios.FirstAsync();
        owner.Activo = false;
        await DbContext.SaveChangesAsync();

        var payload = new
        {
            Nombre = "Sparky",
            Especie = "Perro",
            Raza = "Dálmata",
            FechaNacimiento = DateTime.Today.AddYears(-2),
            Sexo = "Macho",
            Color = "Blanco y Negro",
            PropietarioId = owner.Id
        };

        // Act
        var response = await Client.PostAsJsonAsync("api/mascotas", payload);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task CreateWeightRecord_WithValidWeight_AddsToHistory()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var pet = await DbContext.Mascotas.FirstAsync();
        var payload = new
        {
            PesoKg = 25.5,
            FechaRegistro = DateTime.Today,
            MascotaId = pet.Id
        };

        // Act
        var response = await Client.PostAsJsonAsync($"api/mascotas/{pet.Id}/pesos", payload);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var recordId = await response.Content.ReadFromJsonAsync<int>();
        Assert.IsTrue(recordId > 0);

        // Verify direct list from endpoint
        var listResponse = await Client.GetAsync($"api/mascotas/{pet.Id}/pesos");
        Assert.AreEqual(HttpStatusCode.OK, listResponse.StatusCode);
        var weights = await listResponse.Content.ReadFromJsonAsync<List<RegistroPeso>>();
        Assert.IsNotNull(weights);
        Assert.IsTrue(weights.Exists(w => w.PesoKg == 25.5));
    }

    [TestMethod]
    public async Task Delete_AsAuthenticated_SoftDeletesPet()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var pet = await DbContext.Mascotas.FirstAsync();

        // Act
        var response = await Client.DeleteAsync($"api/mascotas/{pet.Id}");

        // Assert
        Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);

        DbContext.Entry(pet).State = EntityState.Detached;
        var deletedPet = await DbContext.Mascotas.FindAsync(pet.Id);
        Assert.IsNotNull(deletedPet);
        Assert.IsFalse(deletedPet.Activo);
    }

    private class PagedListDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
    }

    private class MascotaDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
    }
}

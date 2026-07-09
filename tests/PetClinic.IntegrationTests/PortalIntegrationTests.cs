using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Consultas.Models;
using PetClinic.Application.Hospitalizaciones.Models;
using PetClinic.Application.Mascotas.Models;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PetClinic.IntegrationTests;

[TestClass]
public class PortalIntegrationTests : IntegrationTestBase
{
    [TestMethod]
    public async Task GetMyPets_WhenAuthenticatedAsPropietario_ReturnsOnlyTheirPets()
    {
        // Arrange
        await AuthenticateAsync("juan.perez@test.com", "Admin123!");

        // Act
        var response = await Client.GetAsync("api/portal/pets");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var pets = await response.Content.ReadFromJsonAsync<List<MascotaDto>>();
        Assert.IsNotNull(pets);
        Assert.IsTrue(pets.Count > 0);
        // Todos los animales listados deben pertenecer a Juan Pérez
        Assert.IsTrue(pets.All(p => p.PropietarioNombreCompleto == "Juan Perez"));
    }

    [TestMethod]
    public async Task GetPetHistory_WhenAuthenticatedAsPropietario_ExcludesInternalNotes()
    {
        // Arrange
        await AuthenticateAsync("juan.perez@test.com", "Admin123!");

        // Obtener el ID de la mascota de Juan Pérez ("Toby")
        var toby = await DbContext.Mascotas.FirstOrDefaultAsync(m => m.Nombre == "Toby");
        Assert.IsNotNull(toby);

        // Act
        var response = await Client.GetAsync($"api/portal/pets/{toby.Id}/history");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        // Validar la ausencia de la propiedad NotasAdicionales en la cadena JSON cruda
        var rawJson = await response.Content.ReadAsStringAsync();
        Assert.IsFalse(rawJson.Contains("notasAdicionales"), "El JSON enviado al cliente no debe contener notas internas del veterinario.");
        Assert.IsFalse(rawJson.Contains("NotasAdicionales"), "El JSON enviado al cliente no debe contener notas internas del veterinario.");

        // Deserializar para validar otros campos
        var history = await response.Content.ReadFromJsonAsync<List<PortalConsultaDto>>();
        Assert.IsNotNull(history);
        Assert.IsTrue(history.Count > 0);
        Assert.IsNotNull(history[0].Diagnostico);
    }

    [TestMethod]
    public async Task GetPetHistory_ForPetOfAnotherOwner_ReturnsNotFound()
    {
        // Arrange
        await AuthenticateAsync("juan.perez@test.com", "Admin123!");

        // Obtener el ID de la mascota de Maria Garcia ("Luna")
        var luna = await DbContext.Mascotas.FirstOrDefaultAsync(m => m.Nombre == "Luna");
        Assert.IsNotNull(luna);

        // Act
        var response = await Client.GetAsync($"api/portal/pets/{luna.Id}/history");

        // Assert
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
    }

    [TestMethod]
    public async Task GetPortalEndpoints_WhenUnauthenticated_ReturnsUnauthorized()
    {
        // Act
        var response = await Client.GetAsync("api/portal/pets");

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Application.Consultas.Models;
using PetClinic.Application.Hospitalizaciones.Models;
using PetClinic.Application.Mascotas.Models;
using PetClinic.Domain.Entities;
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
        var owner = await DbContext.Propietarios.FirstAsync();
        var ownerPets = await DbContext.Mascotas.Where(m => m.PropietarioId == owner.Id).ToListAsync();
        Assert.IsTrue(ownerPets.Count > 0);

        await AuthenticateAsync(owner.CorreoElectronico, "Admin123!");

        // Act
        var response = await Client.GetAsync("api/portal/pets");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var pets = await response.Content.ReadFromJsonAsync<List<MascotaDto>>();
        Assert.IsNotNull(pets);
        Assert.AreEqual(ownerPets.Count, pets.Count);
        // Todos los animales listados deben pertenecer al propietario
        Assert.IsTrue(pets.All(p => p.PropietarioNombreCompleto == owner.NombreCompleto));
    }

    [TestMethod]
    public async Task GetPetHistory_WhenAuthenticatedAsPropietario_ExcludesInternalNotes()
    {
        // Arrange
        var detail = await DbContext.DetallesConsultas.FirstAsync();
        var pet = await DbContext.Mascotas.FindAsync(detail.MascotaId);
        Assert.IsNotNull(pet);
        var owner = await DbContext.Propietarios.FindAsync(pet.PropietarioId);
        Assert.IsNotNull(owner);

        await AuthenticateAsync(owner.CorreoElectronico, "Admin123!");

        // Act
        var response = await Client.GetAsync($"api/portal/pets/{pet.Id}/history");

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
        var owner1 = await DbContext.Propietarios.FirstAsync();
        var owner2 = await DbContext.Propietarios.FirstAsync(p => p.Id != owner1.Id);
        var petOfOwner2 = await DbContext.Mascotas.FirstAsync(m => m.PropietarioId == owner2.Id);

        await AuthenticateAsync(owner1.CorreoElectronico, "Admin123!");

        // Act
        var response = await Client.GetAsync($"api/portal/pets/{petOfOwner2.Id}/history");

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

    [TestMethod]
    public async Task Vincular_WithValidOtp_LinksAccountAndActivates()
    {
        // Arrange
        var owner = new Propietario 
        { 
            NombreCompleto = "Presencial Cliente", 
            Telefono = "123456", 
            CorreoElectronico = "old@client.com", 
            Direccion = "Calle 123", 
            Activo = false, 
            CodigoVinculacion = "777777", 
            ExpiracionCodigo = DateTime.UtcNow.AddMinutes(5) 
        };
        DbContext.Propietarios.Add(owner);
        await DbContext.SaveChangesAsync();

        AuthenticateFirebase("firebase-uid-test", "old@client.com");

        // Act
        var response = await Client.PostAsJsonAsync("api/portal/vincular", new { Codigo = "777777" });

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        // Validar base de datos
        var dbOwner = await DbContext.Propietarios.AsNoTracking().FirstOrDefaultAsync(p => p.Id == owner.Id);
        Assert.IsNotNull(dbOwner);
        Assert.IsTrue(dbOwner.Activo);
        Assert.AreEqual("firebase-uid-test", dbOwner.FirebaseUserId);
        Assert.IsNull(dbOwner.CodigoVinculacion);
    }

    [TestMethod]
    public async Task GetMyPets_WhenAccountIsUnverified_ReturnsForbidden()
    {
        // Arrange
        var owner = new Propietario 
        { 
            NombreCompleto = "Remoto Pendiente", 
            Telefono = "654321", 
            CorreoElectronico = "remoto.pendiente@test.com", 
            Direccion = "Calle 456", 
            Activo = false, 
            FirebaseUserId = "firebase-uid-unverified" 
        };
        DbContext.Propietarios.Add(owner);
        await DbContext.SaveChangesAsync();

        AuthenticateFirebase("firebase-uid-unverified", "remoto.pendiente@test.com");

        // Act
        var response = await Client.GetAsync("api/portal/pets");

        // Assert
        Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [TestMethod]
    public async Task RegistroRemoto_CreatesInactiveProfile()
    {
        // Arrange
        AuthenticateFirebase("firebase-uid-remote", "remote@test.com");

        // Act
        var response = await Client.PostAsJsonAsync("api/portal/registro-remoto", new 
        { 
            NombreCompleto = "Remoto Nuevo", 
            Telefono = "999888777", 
            Direccion = "Av. Siempre Viva 742" 
        });

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        // Validar base de datos
        var dbOwner = await DbContext.Propietarios.FirstOrDefaultAsync(p => p.FirebaseUserId == "firebase-uid-remote");
        Assert.IsNotNull(dbOwner);
        Assert.IsFalse(dbOwner.Activo);
        Assert.AreEqual("remote@test.com", dbOwner.CorreoElectronico);
        Assert.AreEqual("Remoto Nuevo", dbOwner.NombreCompleto);
    }

    private void AuthenticateFirebase(string uid, string email)
    {
        var token = GenerateMockFirebaseToken(uid, email);
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    private string GenerateMockFirebaseToken(string uid, string email)
    {
        return $"mock_{uid}_{email}";
    }
}

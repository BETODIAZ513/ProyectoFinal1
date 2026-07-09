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
public class CitaIntegrationTests : IntegrationTestBase
{
    [TestMethod]
    public async Task GetPaged_AsAdmin_ReturnsPagedAppointments()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");

        // Act
        var response = await Client.GetAsync("api/citas?page=1&pageSize=5");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<PagedListDto<CitaDto>>();
        Assert.IsNotNull(result);
        Assert.AreEqual(10, result.TotalCount); // 10 appointments seeded
        Assert.AreEqual(5, result.Items.Count);
    }

    [TestMethod]
    public async Task Create_AsReceptionist_SchedulesAppointment()
    {
        // Arrange
        await AuthenticateAsync("recep1@petclinic.com", "Admin123!");
        var pet = await DbContext.Mascotas.FirstAsync();
        var vet = await DbContext.Veterinarios.FirstAsync();

        var payload = new
        {
            MascotaId = pet.Id,
            VeterinarioId = vet.Id,
            FechaHora = DateTime.Today.AddDays(5).AddHours(14),
            Motivo = "Revisión dental"
        };

        // Act
        var response = await Client.PostAsJsonAsync("api/citas", payload);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var appointmentId = await response.Content.ReadFromJsonAsync<int>();
        Assert.IsTrue(appointmentId > 0);

        var citaInDb = await DbContext.Citas.FindAsync(appointmentId);
        Assert.IsNotNull(citaInDb);
        Assert.AreEqual("Agendada", citaInDb.Estado);
        Assert.AreEqual("Revisión dental", citaInDb.Motivo);
    }

    [TestMethod]
    public async Task Create_OverlappingAppointment_ReturnsBadRequest()
    {
        // Arrange
        await AuthenticateAsync("recep1@petclinic.com", "Admin123!");
        var pet = await DbContext.Mascotas.FirstAsync();
        var vet = await DbContext.Veterinarios.FirstAsync();
        var appointmentTime = DateTime.Today.AddDays(5).AddHours(10);

        // First schedule
        var payload1 = new
        {
            MascotaId = pet.Id,
            VeterinarioId = vet.Id,
            FechaHora = appointmentTime,
            Motivo = "Cita A"
        };
        var res1 = await Client.PostAsJsonAsync("api/citas", payload1);
        Assert.AreEqual(HttpStatusCode.OK, res1.StatusCode);

        // Attempt overlapping schedule (15 minutes later)
        var payload2 = new
        {
            MascotaId = pet.Id,
            VeterinarioId = vet.Id,
            FechaHora = appointmentTime.AddMinutes(15),
            Motivo = "Cita B (Overlaps)"
        };

        // Act
        var response = await Client.PostAsJsonAsync("api/citas", payload2);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task GetToday_AsReceptionist_ReturnsTodayAppointments()
    {
        // Arrange
        await AuthenticateAsync("recep1@petclinic.com", "Admin123!");

        // Act
        var response = await Client.GetAsync("api/citas/hoy");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var todayList = await response.Content.ReadFromJsonAsync<List<CitaDto>>();
        Assert.IsNotNull(todayList);
        Assert.IsTrue(todayList.Count >= 3); // 3 today appointments seeded
    }

    [TestMethod]
    public async Task UpdateStatus_ToCancel_UpdatesStatus()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");
        var cita = await DbContext.Citas.FirstOrDefaultAsync(c => c.Estado == "Agendada");
        Assert.IsNotNull(cita);

        var payload = new
        {
            Id = cita.Id,
            Estado = "Cancelada"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"api/citas/{cita.Id}/estado", payload);

        // Assert
        Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);

        DbContext.Entry(cita).State = EntityState.Detached;
        var updatedCita = await DbContext.Citas.FindAsync(cita.Id);
        Assert.IsNotNull(updatedCita);
        Assert.AreEqual("Cancelada", updatedCita.Estado);
    }

    private class PagedListDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
    }

    private class CitaDto
    {
        public int Id { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string Motivo { get; set; } = string.Empty;
    }
}

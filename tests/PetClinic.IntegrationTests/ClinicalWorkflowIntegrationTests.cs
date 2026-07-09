using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Domain.Entities;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PetClinic.IntegrationTests;

[TestClass]
public class ClinicalWorkflowIntegrationTests : IntegrationTestBase
{
    [TestMethod]
    public async Task Hospitalization_AdmitAndDischarge_SavesAndUpdatesInDb()
    {
        // Arrange
        await AuthenticateAsync("vet1@petclinic.com", "Admin123!");
        var pet = await DbContext.Mascotas.FirstAsync();

        var admitPayload = new
        {
            MascotaId = pet.Id,
            Motivo = "Sospecha de intoxicación",
            NumeroJaula = "Jaula 10"
        };

        // Act - Admit
        var admitResponse = await Client.PostAsJsonAsync("api/hospitalizaciones", admitPayload);
        Assert.AreEqual(HttpStatusCode.OK, admitResponse.StatusCode);
        var hospId = await admitResponse.Content.ReadFromJsonAsync<int>();
        Assert.IsTrue(hospId > 0);

        // Verify active list
        var listResponse = await Client.GetAsync("api/hospitalizaciones");
        Assert.AreEqual(HttpStatusCode.OK, listResponse.StatusCode);
        var activeHosp = await listResponse.Content.ReadFromJsonAsync<List<HospitalizacionDto>>();
        Assert.IsNotNull(activeHosp);
        Assert.IsTrue(activeHosp.Exists(h => h.Id == hospId));

        // Act - Discharge
        var dischargeResponse = await Client.PutAsync($"api/hospitalizaciones/{hospId}/alta", null);
        Assert.AreEqual(HttpStatusCode.NoContent, dischargeResponse.StatusCode);

        // Verify discharged status in DB
        var hospInDb = await DbContext.Hospitalizaciones.FindAsync(hospId);
        Assert.IsNotNull(hospInDb);
        Assert.AreEqual("Alta", hospInDb.Estado);
        Assert.IsNotNull(hospInDb.FechaAlta);
    }

    [TestMethod]
    public async Task Telemetry_AddMonitoringRecord_SavesAndRetrievesHistory()
    {
        // Arrange
        await AuthenticateAsync("vet1@petclinic.com", "Admin123!");
        
        // Fetch active hospitalization from seeded data
        var activeHosp = await DbContext.Hospitalizaciones.FirstAsync(h => h.Estado == "Internado");
        var payload = new
        {
            HospitalizacionId = activeHosp.Id,
            FrecuenciaCardiaca = 110,
            FrecuenciaRespiratoria = 30,
            Temperatura = 39.2m,
            EstadoAlerta = "Estable",
            MedicamentosAdministrados = "Antipirético 5ml",
            NotasMonitoreo = "Temperatura elevada, se aplica antipirético.",
            RegistradoPor = "vet1@petclinic.com"
        };

        // Act
        var response = await Client.PostAsJsonAsync("api/hospitalizaciones/monitoreos", payload);
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var monitorId = await response.Content.ReadFromJsonAsync<int>();
        Assert.IsTrue(monitorId > 0);

        // Retrieve monitoring history
        var historyResponse = await Client.GetAsync($"api/hospitalizaciones/{activeHosp.Id}/monitoreos");
        Assert.AreEqual(HttpStatusCode.OK, historyResponse.StatusCode);
        var list = await historyResponse.Content.ReadFromJsonAsync<List<MonitoreoClinicoDto>>();
        Assert.IsNotNull(list);
        Assert.IsTrue(list.Exists(m => m.Id == monitorId));
    }

    [TestMethod]
    public async Task Tasks_CreateAndCompleteClinicalTask_UpdatesState()
    {
        // Arrange
        await AuthenticateAsync("vet1@petclinic.com", "Admin123!");
        var pet = await DbContext.Mascotas.FirstAsync();

        // 1. Get predefined tasks catalog
        var predefResponse = await Client.GetAsync("api/tareas-predefinidas");
        Assert.AreEqual(HttpStatusCode.OK, predefResponse.StatusCode);
        var predefList = await predefResponse.Content.ReadFromJsonAsync<List<TareaPredefinida>>();
        Assert.IsNotNull(predefList);
        Assert.IsTrue(predefList.Count > 0);

        // 2. Create custom clinical task
        var payload = new
        {
            Titulo = "Administrar antibiótico",
            Descripcion = "Dosis de Cefalexina 250mg cada 12 horas",
            MascotaId = pet.Id,
            VeterinarioApplicationUserId = "dummy",
            CitaId = (int?)null
        };

        var createResponse = await Client.PostAsJsonAsync("api/tareas-clinicas", payload);
        Assert.AreEqual(HttpStatusCode.OK, createResponse.StatusCode);
        var taskId = await createResponse.Content.ReadFromJsonAsync<int>();
        Assert.IsTrue(taskId > 0);

        // Verify task state in database
        var taskInDb = await DbContext.TareasClinicas.FindAsync(taskId);
        Assert.IsNotNull(taskInDb);
        Assert.AreEqual("Pendiente", taskInDb.Estado);

        // 3. Update task state to Completed
        var updatePayload = new
        {
            Id = taskId,
            Estado = "Completada"
        };
        var updateResponse = await Client.PutAsJsonAsync($"api/tareas-clinicas/{taskId}/estado", updatePayload);
        Assert.AreEqual(HttpStatusCode.NoContent, updateResponse.StatusCode);

        // Verify completed in database
        DbContext.Entry(taskInDb).State = EntityState.Detached;
        var updatedTask = await DbContext.TareasClinicas.FindAsync(taskId);
        Assert.IsNotNull(updatedTask);
        Assert.AreEqual("Completada", updatedTask.Estado);
    }

    [TestMethod]
    public async Task ConsultationDetails_CreateAndGetHistory_SavesAndQueries()
    {
        // Arrange
        await AuthenticateAsync("vet1@petclinic.com", "Admin123!");
        
        // Find appointment that is not completed or cancelled
        var activeCita = await DbContext.Citas.FirstAsync(c => c.Estado == "Agendada");
        var payload = new
        {
            CitaId = activeCita.Id,
            MascotaId = activeCita.MascotaId,
            VeterinarioId = activeCita.VeterinarioId,
            Diagnostico = "Infección de oído externo",
            Tratamiento = "Gotas óticas cada 8 horas por 7 días",
            NotasAdicionales = "Control en una semana."
        };

        // Act - Create consultation detail
        var response = await Client.PostAsJsonAsync("api/consultas-detalles", payload);
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var detailId = await response.Content.ReadFromJsonAsync<int>();
        Assert.IsTrue(detailId > 0);

        // Retrieve clinical history for the pet
        var historyResponse = await Client.GetAsync($"api/consultas-detalles/mascota/{activeCita.MascotaId}");
        Assert.AreEqual(HttpStatusCode.OK, historyResponse.StatusCode);
        var list = await historyResponse.Content.ReadFromJsonAsync<List<DetalleConsultaDto>>();
        Assert.IsNotNull(list);
        Assert.IsTrue(list.Exists(d => d.Id == detailId));
    }

    private class HospitalizacionDto
    {
        public int Id { get; set; }
        public string Estado { get; set; } = string.Empty;
    }

    private class MonitoreoClinicoDto
    {
        public int Id { get; set; }
    }

    private class DetalleConsultaDto
    {
        public int Id { get; set; }
    }
}

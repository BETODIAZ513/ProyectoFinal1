using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PetClinic.Infrastructure.Identity;
using PetClinic.Infrastructure.Persistence;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PetClinic.IntegrationTests;

[TestClass]
public abstract class IntegrationTestBase
{
    protected static CustomWebApplicationFactory Factory = null!;
    protected HttpClient Client = null!;
    protected PetClinicDbContext DbContext = null!;
    protected IServiceProvider ServiceProvider = null!;

    [AssemblyInitialize]
    public static void AssemblyInit(TestContext context)
    {
        Factory = new CustomWebApplicationFactory();
    }

    [AssemblyCleanup]
    public static void AssemblyCleanup()
    {
        Factory.Dispose();
    }

    [TestInitialize]
    public async Task TestInit()
    {
        Client = Factory.CreateClient();
        ServiceProvider = Factory.Services;
        
        var scope = ServiceProvider.CreateScope();
        DbContext = scope.ServiceProvider.GetRequiredService<PetClinicDbContext>();

        // Asegurar que los datos base estén sembrados al iniciar cada prueba
        await SeedBaseDataAsync();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        // Limpiar todas las tablas de negocio e identidad entre ejecuciones de pruebas
        // para garantizar aislamiento total de cada prueba.
        await CleanDatabaseTablesAsync();
        DbContext.Dispose();
    }

    private async Task SeedBaseDataAsync()
    {
        using var scope = ServiceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        
        await DbInitializer.SeedDataAsync(DbContext, userManager, roleManager);
    }

    private async Task CleanDatabaseTablesAsync()
    {
        // El orden de borrado respeta la integridad referencial de las llaves foráneas
        var tables = new[]
        {
            "MonitoreosClinicos",
            "TareasClinicas",
            "Hospitalizaciones",
            "DetallesConsultas",
            "Citas",
            "Pesos",
            "Mascotas",
            "Propietarios",
            "Veterinarios",
            "AspNetUserRoles",
            "AspNetUsers",
            "AspNetRoles"
        };

        foreach (var table in tables)
        {
            try
            {
                await DbContext.Database.ExecuteSqlRawAsync($"DELETE FROM [{table}]");
            }
            catch
            {
                // Ignorar si la tabla está vacía o no tiene relación en este momento
            }
        }
    }

    protected async Task AuthenticateAsync(string email, string password)
    {
        var response = await Client.PostAsJsonAsync("api/auth/login", new
        {
            UsernameOrEmail = email,
            Password = password
        });

        response.EnsureSuccessStatusCode();

        var loginResult = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        Assert.IsNotNull(loginResult);
        Assert.IsNotNull(loginResult.Token);

        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginResult.Token);
    }

    private class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
    }
}

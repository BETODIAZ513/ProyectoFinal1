using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PetClinic.Infrastructure.Persistence;
using System;
using System.Collections.Generic;

namespace PetClinic.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private static readonly object _dbInitLock = new();
    private static bool _dbInitialized = false;
    
    // Base de datos física de pruebas de integración
    private const string TestConnectionString = "Data Source=127.0.0.1;Initial Catalog=PetClinicDb_IntegrationTests;User ID=sa;Password=ClinicaMascotas2026#;TrustServerCertificate=True";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // 1. Sobrescribir la configuración del connection string en memoria
        // para que AddInfrastructureServices use SQL Server directamente en lugar de InMemory
        builder.ConfigureAppConfiguration((context, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "ConnectionStrings:DefaultConnection", TestConnectionString }
            });
        });

        // 2. Inicializar la base de datos limpia una sola vez
        builder.ConfigureServices(services =>
        {
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var scopedServices = scope.ServiceProvider;
            var db = scopedServices.GetRequiredService<PetClinicDbContext>();
            var logger = scopedServices.GetRequiredService<ILogger<CustomWebApplicationFactory>>();

            lock (_dbInitLock)
            {
                if (!_dbInitialized)
                {
                    try
                    {
                        db.Database.EnsureDeleted();
                        db.Database.EnsureCreated();
                        _dbInitialized = true;
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Ocurrió un error al preparar la base de datos de integración.");
                        throw;
                    }
                }
            }
        });
    }
}

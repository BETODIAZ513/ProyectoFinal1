using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;

namespace PetClinic.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    // Base de datos física de pruebas de integración
    private const string TestConnectionString = "Data Source=127.0.0.1;Initial Catalog=PetClinicDb_IntegrationTests;User ID=sa;Password=ClinicaMascotas2026#;TrustServerCertificate=True";

    public CustomWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", TestConnectionString);
        Environment.SetEnvironmentVariable("ConnectionStrings:DefaultConnection", TestConnectionString);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Forzar el connection string en la configuración del host antes de que se construya
        builder.UseSetting("ConnectionStrings:DefaultConnection", TestConnectionString);
        builder.UseSetting("ConnectionStrings__DefaultConnection", TestConnectionString);

        builder.ConfigureAppConfiguration((context, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "ConnectionStrings:DefaultConnection", TestConnectionString }
            });
        });
    }
}

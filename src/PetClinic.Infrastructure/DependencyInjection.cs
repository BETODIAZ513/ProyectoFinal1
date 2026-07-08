using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Infrastructure.Identity;
using PetClinic.Infrastructure.Persistence;

namespace PetClinic.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrEmpty(connectionString))
        {
            // Base de datos en memoria para pruebas y desarrollo si no hay base física configurada
            services.AddDbContext<PetClinicDbContext>(options =>
                options.UseInMemoryDatabase("PetClinicDb"));
        }
        else
        {
            services.AddDbContext<PetClinicDbContext>(options =>
                options.UseSqlServer(connectionString));
        }

        // Registrar Identity
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
        })
        .AddEntityFrameworkStores<PetClinicDbContext>()
        .AddDefaultTokenProviders();

        // Inyección de servicios
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        return services;
    }
}

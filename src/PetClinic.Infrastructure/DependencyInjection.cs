using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace PetClinic.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // En los siguientes sprints configuraremos el DbContext y los repositorios reales.
        
        return services;
    }
}

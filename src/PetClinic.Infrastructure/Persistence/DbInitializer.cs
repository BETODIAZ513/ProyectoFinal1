using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using PetClinic.Infrastructure.Identity;
using PetClinic.Domain.Entities;

namespace PetClinic.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedDataAsync(
        PetClinicDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        // 1. Asegurar Roles
        var roles = new[] { "Administrador", "Veterinario", "AuxiliarClinico", "Recepcionista" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2. Sembrar Administradores (2)
        var admins = new[]
        {
            new { Email = "admin1@petclinic.com", UserName = "admin1", Nombre = "Carlos Administrador" },
            new { Email = "admin2@petclinic.com", UserName = "admin2", Nombre = "Sofía Administradora" }
        };
        foreach (var adm in admins)
        {
            if (await userManager.FindByEmailAsync(adm.Email) == null)
            {
                var user = new ApplicationUser
                {
                    UserName = adm.UserName,
                    Email = adm.Email,
                    NombreCompleto = adm.Nombre,
                    EmailConfirmed = true,
                    Activo = true
                };
                var result = await userManager.CreateAsync(user, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "Administrador");
                }
            }
        }

        // 3. Sembrar Veterinarios (4)
        var vetsInfo = new[]
        {
            new { Email = "vet1@petclinic.com", UserName = "vet1", Nombre = "Dr. Roberto Gomez", Especialidad = "Cirugía", Colegiatura = "VET1001", Telefono = "981234567" },
            new { Email = "vet2@petclinic.com", UserName = "vet2", Nombre = "Dra. Laura Torres", Especialidad = "Dermatología", Colegiatura = "VET1002", Telefono = "982345678" },
            new { Email = "vet3@petclinic.com", UserName = "vet3", Nombre = "Dr. Miguel Rivas", Especialidad = "Medicina Interna", Colegiatura = "VET1003", Telefono = "983456789" },
            new { Email = "vet4@petclinic.com", UserName = "vet4", Nombre = "Dra. Elena Diaz", Especialidad = "Cardiología", Colegiatura = "VET1004", Telefono = "984567890" }
        };

        foreach (var v in vetsInfo)
        {
            var identityUser = await userManager.FindByEmailAsync(v.Email);
            if (identityUser == null)
            {
                identityUser = new ApplicationUser
                {
                    UserName = v.UserName,
                    Email = v.Email,
                    NombreCompleto = v.Nombre,
                    EmailConfirmed = true,
                    Activo = true
                };
                var result = await userManager.CreateAsync(identityUser, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(identityUser, "Veterinario");
                }
            }

            // Asegurar que exista su perfil en la tabla de dominio de Veterinarios
            if (!context.Veterinarios.Any(vet => vet.CorreoElectronico == v.Email))
            {
                var vetProfile = new Veterinario
                {
                    NombreCompleto = v.Nombre,
                    Especialidad = v.Especialidad,
                    NumeroColegiatura = v.Colegiatura,
                    Telefono = v.Telefono,
                    CorreoElectronico = v.Email,
                    ApplicationUserId = identityUser.Id,
                    Activo = true
                };
                context.Veterinarios.Add(vetProfile);
            }
        }
        await context.SaveChangesAsync();

        // 4. Sembrar Auxiliares (3)
        var auxs = new[]
        {
            new { Email = "aux1@petclinic.com", UserName = "aux1", Nombre = "Sandro Auxiliar" },
            new { Email = "aux2@petclinic.com", UserName = "aux2", Nombre = "Patricia Auxiliar" },
            new { Email = "aux3@petclinic.com", UserName = "aux3", Nombre = "Diego Auxiliar" }
        };
        foreach (var ax in auxs)
        {
            if (await userManager.FindByEmailAsync(ax.Email) == null)
            {
                var user = new ApplicationUser
                {
                    UserName = ax.UserName,
                    Email = ax.Email,
                    NombreCompleto = ax.Nombre,
                    EmailConfirmed = true,
                    Activo = true
                };
                var result = await userManager.CreateAsync(user, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "AuxiliarClinico");
                }
            }
        }

        // 5. Sembrar Recepcionistas (2)
        var receps = new[]
        {
            new { Email = "recep1@petclinic.com", UserName = "recep1", Nombre = "Ana Recepcionista" },
            new { Email = "recep2@petclinic.com", UserName = "recep2", Nombre = "Luis Recepcionista" }
        };
        foreach (var rec in receps)
        {
            if (await userManager.FindByEmailAsync(rec.Email) == null)
            {
                var user = new ApplicationUser
                {
                    UserName = rec.UserName,
                    Email = rec.Email,
                    NombreCompleto = rec.Nombre,
                    EmailConfirmed = true,
                    Activo = true
                };
                var result = await userManager.CreateAsync(user, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "Recepcionista");
                }
            }
        }

        // 6. Sembrar Propietarios (10)
        if (!context.Propietarios.Any())
        {
            var owners = new[]
            {
                new Propietario { NombreCompleto = "Juan Perez", Telefono = "911222333", CorreoElectronico = "juan.perez@test.com", Direccion = "Av. Benavides 1230, Miraflores", Activo = true },
                new Propietario { NombreCompleto = "Maria Garcia", Telefono = "922333444", CorreoElectronico = "maria.garcia@test.com", Direccion = "Calle Las Magnolias 450, San Isidro", Activo = true },
                new Propietario { NombreCompleto = "Carlos Sanchez", Telefono = "933444555", CorreoElectronico = "carlos.sanchez@test.com", Direccion = "Av. Larco 980, Miraflores", Activo = true },
                new Propietario { NombreCompleto = "Ana Martinez", Telefono = "944555666", CorreoElectronico = "ana.martinez@test.com", Direccion = "Javier Prado 3200, San Borja", Activo = true },
                new Propietario { NombreCompleto = "Luis Rodriguez", Telefono = "955666777", CorreoElectronico = "luis.rod@test.com", Direccion = "Jr. Ica 456, Surco", Activo = true },
                new Propietario { NombreCompleto = "Carmen Gomez", Telefono = "966777888", CorreoElectronico = "carmen.g@test.com", Direccion = "Av. El Polo 102, Surco", Activo = true },
                new Propietario { NombreCompleto = "Pedro Fernandez", Telefono = "977888999", CorreoElectronico = "pedro.f@test.com", Direccion = "Jr. Huallaga 122, Lima", Activo = true },
                new Propietario { NombreCompleto = "Lucia Diaz", Telefono = "988999000", CorreoElectronico = "lucia.d@test.com", Direccion = "Calle Tulipanes 890, La Molina", Activo = true },
                new Propietario { NombreCompleto = "Jorge Alvarez", Telefono = "999000111", CorreoElectronico = "jorge.alv@test.com", Direccion = "Av. Arequipa 4420, Miraflores", Activo = true },
                new Propietario { NombreCompleto = "Rosa Romero", Telefono = "900111222", CorreoElectronico = "rosa.rom@test.com", Direccion = "Av. Canada 1800, San Luis", Activo = true }
            };
            context.Propietarios.AddRange(owners);
            await context.SaveChangesAsync();
        }

        // 7. Sembrar Mascotas (15)
        if (!context.Mascotas.Any())
        {
            var p1 = context.Propietarios.First(p => p.NombreCompleto == "Juan Perez").Id;
            var p2 = context.Propietarios.First(p => p.NombreCompleto == "Maria Garcia").Id;
            var p3 = context.Propietarios.First(p => p.NombreCompleto == "Carlos Sanchez").Id;
            var p4 = context.Propietarios.First(p => p.NombreCompleto == "Ana Martinez").Id;
            var p5 = context.Propietarios.First(p => p.NombreCompleto == "Luis Rodriguez").Id;
            var p6 = context.Propietarios.First(p => p.NombreCompleto == "Carmen Gomez").Id;
            var p7 = context.Propietarios.First(p => p.NombreCompleto == "Pedro Fernandez").Id;
            var p8 = context.Propietarios.First(p => p.NombreCompleto == "Lucia Diaz").Id;
            var p9 = context.Propietarios.First(p => p.NombreCompleto == "Jorge Alvarez").Id;
            var p10 = context.Propietarios.First(p => p.NombreCompleto == "Rosa Romero").Id;

            var pets = new[]
            {
                new Mascota { Nombre = "Toby", Especie = "Perro", Raza = "Golden Retriever", FechaNacimiento = DateTime.Today.AddYears(-3), Sexo = "Macho", Color = "Dorado", PropietarioId = p1, Activo = true },
                new Mascota { Nombre = "Bucky", Especie = "Perro", Raza = "Labrador", FechaNacimiento = DateTime.Today.AddYears(-1), Sexo = "Macho", Color = "Negro", PropietarioId = p1, Activo = true },
                new Mascota { Nombre = "Luna", Especie = "Gato", Raza = "Siamés", FechaNacimiento = DateTime.Today.AddYears(-2), Sexo = "Hembra", Color = "Crema/Marrón", PropietarioId = p2, Activo = true },
                new Mascota { Nombre = "Kitty", Especie = "Gato", Raza = "Persa", FechaNacimiento = DateTime.Today.AddYears(-4), Sexo = "Hembra", Color = "Blanco", PropietarioId = p2, Activo = true },
                new Mascota { Nombre = "Rocky", Especie = "Perro", Raza = "Pastor Alemán", FechaNacimiento = DateTime.Today.AddYears(-5), Sexo = "Macho", Color = "Negro/Fuego", PropietarioId = p3, Activo = true },
                new Mascota { Nombre = "Rex", Especie = "Perro", Raza = "Rottweiler", FechaNacimiento = DateTime.Today.AddYears(-2), Sexo = "Macho", Color = "Negro", PropietarioId = p3, Activo = true },
                new Mascota { Nombre = "Bella", Especie = "Perro", Raza = "Poodle", FechaNacimiento = DateTime.Today.AddYears(-6), Sexo = "Hembra", Color = "Blanco", PropietarioId = p4, Activo = true },
                new Mascota { Nombre = "Chloe", Especie = "Gato", Raza = "Bengala", FechaNacimiento = DateTime.Today.AddYears(-1), Sexo = "Hembra", Color = "Atigrado", PropietarioId = p4, Activo = true },
                new Mascota { Nombre = "Coco", Especie = "Perro", Raza = "Chihuahua", FechaNacimiento = DateTime.Today.AddYears(-2), Sexo = "Macho", Color = "Marrón", PropietarioId = p5, Activo = true },
                new Mascota { Nombre = "Misi", Especie = "Gato", Raza = "Angora", FechaNacimiento = DateTime.Today.AddYears(-3), Sexo = "Hembra", Color = "Gris", PropietarioId = p6, Activo = true },
                new Mascota { Nombre = "Simba", Especie = "Gato", Raza = "Mestizo", FechaNacimiento = DateTime.Today.AddYears(-1), Sexo = "Macho", Color = "Naranja", PropietarioId = p6, Activo = true },
                new Mascota { Nombre = "Max", Especie = "Perro", Raza = "Beagle", FechaNacimiento = DateTime.Today.AddYears(-4), Sexo = "Macho", Color = "Tricolor", PropietarioId = p7, Activo = true },
                new Mascota { Nombre = "Kiara", Especie = "Perro", Raza = "Boxer", FechaNacimiento = DateTime.Today.AddYears(-3), Sexo = "Hembra", Color = "Fawn", PropietarioId = p8, Activo = true },
                new Mascota { Nombre = "Felix", Especie = "Gato", Raza = "Mestizo", FechaNacimiento = DateTime.Today.AddYears(-2), Sexo = "Macho", Color = "Negro y Blanco", PropietarioId = p9, Activo = true },
                new Mascota { Nombre = "Lola", Especie = "Perro", Raza = "Pug", FechaNacimiento = DateTime.Today.AddYears(-2), Sexo = "Hembra", Color = "Arena", PropietarioId = p10, Activo = true }
            };
            context.Mascotas.AddRange(pets);
            await context.SaveChangesAsync();
        }

        // 8. Sembrar Registros de Peso (15, uno por mascota)
        if (!context.Pesos.Any())
        {
            var petsList = context.Mascotas.ToList();
            double defaultWeight = 10.0;
            foreach (var pet in petsList)
            {
                context.Pesos.Add(new RegistroPeso
                {
                    MascotaId = pet.Id,
                    PesoKg = pet.Especie == "Perro" ? defaultWeight + (pet.Id * 1.5) : 3.5 + (pet.Id * 0.1),
                    FechaRegistro = DateTime.Today.AddDays(-15)
                });
            }
            await context.SaveChangesAsync();
        }

        // 9. Sembrar Citas Médicas (10)
        if (!context.Citas.Any())
        {
            var pets = context.Mascotas.Take(10).ToList();
            var vets = context.Veterinarios.Take(4).ToList();

            var appointments = new[]
            {
                // Citas pasadas (Completadas/Canceladas)
                new Cita { MascotaId = pets[0].Id, VeterinarioId = vets[0].Id, FechaHora = DateTime.Today.AddDays(-3).AddHours(9), Motivo = "Control de vacunas anuales", Estado = "Completada" },
                new Cita { MascotaId = pets[1].Id, VeterinarioId = vets[1].Id, FechaHora = DateTime.Today.AddDays(-2).AddHours(10), Motivo = "Dolor estomacal", Estado = "Completada" },
                new Cita { MascotaId = pets[2].Id, VeterinarioId = vets[2].Id, FechaHora = DateTime.Today.AddDays(-2).AddHours(11), Motivo = "Corte de garras", Estado = "Cancelada" },
                new Cita { MascotaId = pets[3].Id, VeterinarioId = vets[3].Id, FechaHora = DateTime.Today.AddDays(-1).AddHours(14), Motivo = "Chequeo cardíaco preventivo", Estado = "Completada" },

                // Citas para hoy (Agendadas)
                new Cita { MascotaId = pets[4].Id, VeterinarioId = vets[0].Id, FechaHora = DateTime.Today.AddHours(9), Motivo = "Revisión general de salud", Estado = "Agendada" },
                new Cita { MascotaId = pets[5].Id, VeterinarioId = vets[1].Id, FechaHora = DateTime.Today.AddHours(10), Motivo = "Limpieza de oídos", Estado = "Agendada" },
                new Cita { MascotaId = pets[6].Id, VeterinarioId = vets[2].Id, FechaHora = DateTime.Today.AddHours(15), Motivo = "Vacunación triple felina", Estado = "Agendada" },

                // Citas futuras (Agendadas)
                new Cita { MascotaId = pets[7].Id, VeterinarioId = vets[3].Id, FechaHora = DateTime.Today.AddDays(1).AddHours(9), Motivo = "Control post-cirugía", Estado = "Agendada" },
                new Cita { MascotaId = pets[8].Id, VeterinarioId = vets[0].Id, FechaHora = DateTime.Today.AddDays(2).AddHours(10), Motivo = "Sospecha de alergia cutánea", Estado = "Agendada" },
                new Cita { MascotaId = pets[9].Id, VeterinarioId = vets[1].Id, FechaHora = DateTime.Today.AddDays(3).AddHours(11), Motivo = "Desparasitación interna", Estado = "Agendada" }
            };
            context.Citas.AddRange(appointments);
            await context.SaveChangesAsync();
        }

        // 10. Sembrar Detalles de Consulta (para las citas completadas)
        if (!context.DetallesConsultas.Any())
        {
            var pastCompletedAppointments = context.Citas.Where(c => c.Estado == "Completada").ToList();
            foreach (var appt in pastCompletedAppointments)
            {
                context.DetallesConsultas.Add(new DetalleConsulta
                {
                    CitaId = appt.Id,
                    MascotaId = appt.MascotaId,
                    VeterinarioId = appt.VeterinarioId,
                    FechaAtencion = appt.FechaHora,
                    Diagnostico = appt.Motivo.Contains("vacuna") ? "Paciente sano. Vacunas al día." : "Gastroenteritis leve. Frecuencias estables.",
                    Tratamiento = appt.Motivo.Contains("vacuna") ? "Ninguno." : "Dieta blanda por 3 días y suero oral.",
                    NotasAdicionales = "Seguimiento telefónico en 48 horas si los síntomas persisten."
                });
            }
            await context.SaveChangesAsync();
        }

        // 11. Sembrar Hospitalizaciones (4)
        if (!context.Hospitalizaciones.Any())
        {
            var pets = context.Mascotas.Take(4).ToList();

            var hospitalizations = new[]
            {
                new Hospitalizacion { MascotaId = pets[0].Id, FechaIngreso = DateTime.Today.AddDays(-2), FechaAlta = DateTime.Today.AddDays(-1), Motivo = "Post-operatorio de castración", Estado = "Alta", NumeroJaula = "Jaula 1" },
                new Hospitalizacion { MascotaId = pets[1].Id, FechaIngreso = DateTime.Today.AddDays(-1), FechaAlta = null, Motivo = "Deshidratación severa por gastroenteritis", Estado = "Internado", NumeroJaula = "Jaula 2" },
                new Hospitalizacion { MascotaId = pets[2].Id, FechaIngreso = DateTime.Today, FechaAlta = null, Motivo = "Traumatismo por atropello leve (observación)", Estado = "Internado", NumeroJaula = "Jaula 3" },
                new Hospitalizacion { MascotaId = pets[3].Id, FechaIngreso = DateTime.Today.AddDays(-4), FechaAlta = DateTime.Today.AddDays(-2), Motivo = "Insuficiencia respiratoria aguda", Estado = "Alta", NumeroJaula = "Jaula 4" }
            };
            context.Hospitalizaciones.AddRange(hospitalizations);
            await context.SaveChangesAsync();
        }

        // 12. Sembrar Monitoreos Clínicos y Tareas para las Hospitalizaciones Activas ("Internado")
        if (!context.MonitoreosClinicos.Any())
        {
            var activeHosp = context.Hospitalizaciones.Where(h => h.Estado == "Internado").ToList();
            foreach (var hosp in activeHosp)
            {
                // Monitoreo
                context.MonitoreosClinicos.Add(new MonitoreoClinico
                {
                    HospitalizacionId = hosp.Id,
                    FechaHora = DateTime.UtcNow.AddHours(-2),
                    FrecuenciaCardiaca = 90,
                    FrecuenciaRespiratoria = 24,
                    Temperatura = 38.8m,
                    EstadoAlerta = "Estable / Alerta",
                    MedicamentosAdministrados = "Suero Fisiológico 10ml/h",
                    NotasMonitoreo = "El paciente responde bien a los estímulos. Constantes dentro del rango normal.",
                    RegistradoPor = "Patricia Auxiliar"
                });

                // Tarea Clínica asociada
                context.TareasClinicas.Add(new TareaClinica
                {
                    Titulo = "Control de Temperatura",
                    Descripcion = "Medición térmica rectal cada 4 horas.",
                    Estado = "Pendiente",
                    MascotaId = hosp.MascotaId,
                    VeterinarioId = context.Veterinarios.First().Id
                });
            }
            await context.SaveChangesAsync();
        }
    }
}

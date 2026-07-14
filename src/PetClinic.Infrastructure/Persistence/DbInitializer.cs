using System;
using System.Linq;
using System.Collections.Generic;
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
        var roles = new[] { "Administrador", "Veterinario", "AuxiliarClinico", "Recepcionista", "Propietario" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Limpiar todas las tablas existentes para evitar conflictos de claves primarias y correos duplicados
        context.MonitoreosClinicos.RemoveRange(context.MonitoreosClinicos);
        context.TareasClinicas.RemoveRange(context.TareasClinicas);
        context.DetallesConsultas.RemoveRange(context.DetallesConsultas);
        context.Citas.RemoveRange(context.Citas);
        context.Pesos.RemoveRange(context.Pesos);
        context.Hospitalizaciones.RemoveRange(context.Hospitalizaciones);
        context.Mascotas.RemoveRange(context.Mascotas);
        context.Propietarios.RemoveRange(context.Propietarios);
        context.Veterinarios.RemoveRange(context.Veterinarios);
        await context.SaveChangesAsync();

        // Eliminar todos los usuarios Identity existentes
        var allUsers = userManager.Users.ToList();
        foreach (var u in allUsers)
        {
            await userManager.DeleteAsync(u);
        }

        // 2. Sembrar Administradores (2)
        var admins = new[]
        {
            new { Email = "admin1@petclinic.com", UserName = "admin1", Nombre = "Carlos Administrador" },
            new { Email = "admin2@petclinic.com", UserName = "admin2", Nombre = "Sofía Administradora" }
        };
        foreach (var adm in admins)
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

        // 3. Sembrar Veterinarios (8 - El doble de los trabajadores originales)
        var vetsInfo = new[]
        {
            new { Email = "vet1@petclinic.com", UserName = "vet1", Nombre = "Dr. Roberto Gomez", Especialidad = "Cirugía", Colegiatura = "VET1001", Telefono = "981234567" },
            new { Email = "vet2@petclinic.com", UserName = "vet2", Nombre = "Dra. Laura Torres", Especialidad = "Dermatología", Colegiatura = "VET1002", Telefono = "982345678" },
            new { Email = "vet3@petclinic.com", UserName = "vet3", Nombre = "Dr. Miguel Rivas", Especialidad = "Medicina Interna", Colegiatura = "VET1003", Telefono = "983456789" },
            new { Email = "vet4@petclinic.com", UserName = "vet4", Nombre = "Dra. Elena Diaz", Especialidad = "Cardiología", Colegiatura = "VET1004", Telefono = "984567890" },
            new { Email = "vet5@petclinic.com", UserName = "vet5", Nombre = "Dr. Carlos Ramos", Especialidad = "Neurología", Colegiatura = "VET1005", Telefono = "985678901" },
            new { Email = "vet6@petclinic.com", UserName = "vet6", Nombre = "Dra. Isabel Ortiz", Especialidad = "Oncología", Colegiatura = "VET1006", Telefono = "986789012" },
            new { Email = "vet7@petclinic.com", UserName = "vet7", Nombre = "Dr. Fernando Ruiz", Especialidad = "Traumatología", Colegiatura = "VET1007", Telefono = "987890123" },
            new { Email = "vet8@petclinic.com", UserName = "vet8", Nombre = "Dra. Gabriela Vega", Especialidad = "Oftalmología", Colegiatura = "VET1008", Telefono = "988901234" }
        };

        foreach (var v in vetsInfo)
        {
            var identityUser = new ApplicationUser
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

        // 4. Sembrar Auxiliares (6 - El doble de los trabajadores originales)
        var auxs = new[]
        {
            new { Email = "aux1@petclinic.com", UserName = "aux1", Nombre = "Sandro Auxiliar" },
            new { Email = "aux2@petclinic.com", UserName = "aux2", Nombre = "Patricia Auxiliar" },
            new { Email = "aux3@petclinic.com", UserName = "aux3", Nombre = "Diego Auxiliar" },
            new { Email = "aux4@petclinic.com", UserName = "aux4", Nombre = "Valeria Auxiliar" },
            new { Email = "aux5@petclinic.com", UserName = "aux5", Nombre = "Hugo Auxiliar" },
            new { Email = "aux6@petclinic.com", UserName = "aux6", Nombre = "Jimena Auxiliar" }
        };
        foreach (var ax in auxs)
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

        // 5. Sembrar Recepcionistas (4 - El doble de los trabajadores originales)
        var receps = new[]
        {
            new { Email = "recep1@petclinic.com", UserName = "recep1", Nombre = "Ana Recepcionista" },
            new { Email = "recep2@petclinic.com", UserName = "recep2", Nombre = "Luis Recepcionista" },
            new { Email = "recep3@petclinic.com", UserName = "recep3", Nombre = "Diana Recepcionista" },
            new { Email = "recep4@petclinic.com", UserName = "recep4", Nombre = "Marcos Recepcionista" }
        };
        foreach (var rec in receps)
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

        // 6. Sembrar Propietarios (40 - El cuádruple de los originales)
        var owners = new List<Propietario>();
        string[] firstNames = { "Juan", "Maria", "Carlos", "Ana", "Luis", "Carmen", "Pedro", "Lucia", "Jorge", "Rosa", "Alberto", "Gabriela", "Felipe", "Sofia", "Oscar", "Camila", "Hugo", "Elena", "Ricardo", "Silvia" };
        string[] lastNames = { "Perez", "Garcia", "Sanchez", "Martinez", "Rodriguez", "Gomez", "Fernandez", "Diaz", "Alvarez", "Romero", "Lopez", "Flores", "Benitez", "Castro", "Cruz", "Ortiz", "Ramos", "Vega", "Torres", "Suarez" };

        for (int i = 1; i <= 40; i++)
        {
            var nombre = $"{firstNames[i % firstNames.Length]} {lastNames[(i * 3) % lastNames.Length]} {i}";
            var email = $"propietario{i}@test.com";
            var owner = new Propietario
            {
                NombreCompleto = nombre,
                Telefono = "9" + i.ToString().PadLeft(8, '0'),
                CorreoElectronico = email,
                Direccion = $"Calle Los Olivos {100 + i * 5}, San Borja",
                Activo = true
            };
            context.Propietarios.Add(owner);
            owners.Add(owner);

            // Sembrar cuenta del Portal de Clientes para cada propietario
            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                NombreCompleto = nombre,
                EmailConfirmed = true,
                Activo = true
            };
            var result = await userManager.CreateAsync(user, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "Propietario");
            }
        }
        await context.SaveChangesAsync();

        // 7. Sembrar Mascotas (60 - El cuádruple de los originales)
        var pets = new List<Mascota>();
        string[] petNames = { "Toby", "Bucky", "Luna", "Kitty", "Rocky", "Rex", "Bella", "Chloe", "Coco", "Misi", "Simba", "Max", "Kiara", "Felix", "Lola", "Bruno", "Zeus", "Nala", "Milo", "Maya" };
        string[] speciesList = { "Perro", "Gato" };
        string[] sexList = { "Macho", "Hembra" };
        string[] colors = { "Dorado", "Negro", "Crema", "Blanco", "Gris", "Atigrado", "Marrón", "Naranja", "Tricolor", "Arena" };

        for (int i = 1; i <= 60; i++)
        {
            var owner = owners[(i - 1) % owners.Count];
            var pet = new Mascota
            {
                Nombre = $"{petNames[i % petNames.Length]} {i}",
                Especie = speciesList[i % speciesList.Length],
                Raza = speciesList[i % speciesList.Length] == "Perro" ? "Labrador" : "Siamés",
                FechaNacimiento = DateTime.Today.AddYears(-(i % 5 + 1)),
                Sexo = sexList[i % sexList.Length],
                Color = colors[i % colors.Length],
                PropietarioId = owner.Id,
                Activo = true
            };
            context.Mascotas.Add(pet);
            pets.Add(pet);
        }
        await context.SaveChangesAsync();

        // 8. Sembrar Registros de Peso (60)
        double defaultWeight = 10.0;
        foreach (var pet in pets)
        {
            context.Pesos.Add(new RegistroPeso
            {
                MascotaId = pet.Id,
                PesoKg = pet.Especie == "Perro" ? defaultWeight + (pet.Id * 0.5) : 3.0 + (pet.Id * 0.05),
                FechaRegistro = DateTime.Today.AddDays(-15)
            });
        }
        await context.SaveChangesAsync();

        // 9. Sembrar Citas Médicas (40 - El cuádruple de las originales)
        var appointments = new List<Cita>();
        var dbVets = context.Veterinarios.ToList();

        for (int i = 1; i <= 40; i++)
        {
            var pet = pets[(i - 1) % pets.Count];
            var vet = dbVets[(i - 1) % dbVets.Count];
            
            string estado = "Agendada";
            DateTime fecha;
            if (i <= 20)
            {
                estado = "Completada";
                fecha = DateTime.Today.AddDays(-(i % 5 + 1)).AddHours(8 + (i % 8));
            }
            else if (i <= 30)
            {
                estado = "Agendada";
                fecha = DateTime.Today.AddHours(8 + (i - 20)); // Evita solapamientos en las citas de hoy
            }
            else
            {
                estado = "Agendada";
                fecha = DateTime.Today.AddDays(i - 30).AddHours(9 + (i % 4));
            }

            var cita = new Cita
            {
                MascotaId = pet.Id,
                VeterinarioId = vet.Id,
                FechaHora = fecha,
                Motivo = i % 2 == 0 ? "Chequeo preventivo de rutina" : "Control de vacunas anuales",
                Estado = estado
            };
            context.Citas.Add(cita);
            appointments.Add(cita);
        }
        await context.SaveChangesAsync();

        // 10. Sembrar Detalles de Consulta (para las citas completadas)
        var completedAppointments = appointments.Where(c => c.Estado == "Completada").ToList();
        foreach (var appt in completedAppointments)
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

        // 11. Sembrar Hospitalizaciones (16 - El cuádruple de las originales)
        var hospitalizations = new List<Hospitalizacion>();
        for (int i = 1; i <= 16; i++)
        {
            var pet = pets[(i - 1) % pets.Count];
            var active = i % 2 == 0;
            var hosp = new Hospitalizacion
            {
                MascotaId = pet.Id,
                FechaIngreso = DateTime.Today.AddDays(-(i % 4 + 1)),
                FechaAlta = active ? null : (DateTime?)DateTime.Today.AddDays(-1),
                Motivo = active ? "Deshidratación severa por gastroenteritis" : "Post-operatorio de castración",
                Estado = active ? "Internado" : "Alta",
                NumeroJaula = $"Jaula {i}"
            };
            context.Hospitalizaciones.Add(hosp);
            hospitalizations.Add(hosp);
        }
        await context.SaveChangesAsync();

        // 12. Sembrar Monitoreos Clínicos y Tareas para las Hospitalizaciones Activas ("Internado")
        var activeHospList = hospitalizations.Where(h => h.Estado == "Internado").ToList();
        foreach (var hosp in activeHospList)
        {
            context.MonitoreosClinicos.Add(new MonitoreoClinico
            {
                HospitalizacionId = hosp.Id,
                FechaHora = DateTime.UtcNow.AddHours(-2),
                FrecuenciaCardiaca = 95,
                FrecuenciaRespiratoria = 22,
                Temperatura = 38.6m,
                EstadoAlerta = "Estable / Alerta",
                MedicamentosAdministrados = "Suero Fisiológico 10ml/h",
                NotasMonitoreo = "El paciente responde bien a los estímulos.",
                RegistradoPor = "Patricia Auxiliar"
            });

            context.TareasClinicas.Add(new TareaClinica
            {
                Titulo = "Control de Temperatura",
                Descripcion = "Medición térmica rectal cada 4 horas.",
                Estado = "Pendiente",
                MascotaId = hosp.MascotaId,
                VeterinarioId = dbVets.First().Id
            });
        }
        await context.SaveChangesAsync();
    }
}

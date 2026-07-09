using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Consultas.Models;
using PetClinic.Application.Consultas.Queries;
using PetClinic.Application.Hospitalizaciones.Models;
using PetClinic.Application.Hospitalizaciones.Queries;
using PetClinic.Application.Mascotas.Models;
using PetClinic.Application.Mascotas.Queries;
using PetClinic.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api/portal")]
[Authorize(Roles = "Propietario")] // Restringido solo a Propietarios (clientes)
public class PortalController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly PetClinicDbContext _context;

    public PortalController(IMediator mediator, PetClinicDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpGet("pets")]
    public async Task<ActionResult<List<MascotaDto>>> GetMyPets()
    {
        var propietarioId = GetPropietarioId();
        if (propietarioId == null)
        {
            return BadRequest(new { Message = "No se pudo identificar el perfil del propietario en la sesión." });
        }

        var pets = await _mediator.Send(new GetPetsForPortalQuery(propietarioId.Value));
        return Ok(pets);
    }

    [HttpGet("pets/{mascotaId}/history")]
    public async Task<ActionResult<List<PortalConsultaDto>>> GetPetHistory(int mascotaId)
    {
        var propietarioId = GetPropietarioId();
        if (propietarioId == null)
        {
            return BadRequest(new { Message = "No se pudo identificar el perfil en la sesión." });
        }

        if (!await IsPetOwnedByPropietarioAsync(mascotaId, propietarioId.Value))
        {
            return NotFound(new { Message = "La mascota no fue encontrada o no pertenece a su perfil." });
        }

        var history = await _mediator.Send(new GetClinicalHistoryQuery(mascotaId));

        // Mapear solo los campos públicos (excluyendo NotasAdicionales internas del veterinario)
        var portalHistory = history.Select(d => new PortalConsultaDto
        {
            Id = d.Id,
            FechaAtencion = d.FechaAtencion,
            Diagnostico = d.Diagnostico,
            Tratamiento = d.Tratamiento,
            VeterinarioNombreCompleto = d.VeterinarioNombreCompleto
        }).ToList();

        return Ok(portalHistory);
    }

    [HttpGet("pets/{mascotaId}/weights")]
    public async Task<ActionResult<IEnumerable<object>>> GetPetWeights(int mascotaId)
    {
        var propietarioId = GetPropietarioId();
        if (propietarioId == null)
        {
            return BadRequest(new { Message = "No se pudo identificar el perfil en la sesión." });
        }

        if (!await IsPetOwnedByPropietarioAsync(mascotaId, propietarioId.Value))
        {
            return NotFound(new { Message = "La mascota no fue encontrada o no pertenece a su perfil." });
        }

        var weights = await _mediator.Send(new GetWeightHistoryQuery(mascotaId));
        return Ok(weights);
    }

    [HttpGet("pets/{mascotaId}/hospitalization")]
    public async Task<ActionResult<HospitalizacionDto>> GetPetHospitalization(int mascotaId)
    {
        var propietarioId = GetPropietarioId();
        if (propietarioId == null)
        {
            return BadRequest(new { Message = "No se pudo identificar el perfil en la sesión." });
        }

        if (!await IsPetOwnedByPropietarioAsync(mascotaId, propietarioId.Value))
        {
            return NotFound(new { Message = "La mascota no fue encontrada o no pertenece a su perfil." });
        }

        var hospitalization = await _mediator.Send(new GetActiveHospitalizationByPetQuery(mascotaId));
        if (hospitalization == null)
        {
            return NoContent();
        }

        return Ok(hospitalization);
    }

    private int? GetPropietarioId()
    {
        var claimValue = User.FindFirst("propietarioId")?.Value;
        if (int.TryParse(claimValue, out var propietarioId))
        {
            return propietarioId;
        }
        return null;
    }

    private async Task<bool> IsPetOwnedByPropietarioAsync(int mascotaId, int propietarioId)
    {
        var pet = await _context.Mascotas.AsNoTracking().FirstOrDefaultAsync(m => m.Id == mascotaId);
        return pet != null && pet.PropietarioId == propietarioId && pet.Activo;
    }
}

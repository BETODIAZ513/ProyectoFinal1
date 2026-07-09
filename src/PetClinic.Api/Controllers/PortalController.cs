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
using PetClinic.Application.Propietarios.Commands;
using PetClinic.Domain.Entities;
using PetClinic.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api/portal")]
[Authorize(AuthenticationSchemes = "Bearer,Firebase")]
public class PortalController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly PetClinicDbContext _context;

    public PortalController(IMediator mediator, PetClinicDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpPost("vincular")]
    [Authorize(AuthenticationSchemes = "Firebase")]
    public async Task<IActionResult> Vincular([FromBody] VincularRequest request)
    {
        var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;

        if (string.IsNullOrEmpty(firebaseUid) || string.IsNullOrEmpty(email))
        {
            return BadRequest(new { Message = "No se pudieron obtener los datos de la cuenta de Google." });
        }

        try
        {
            await _mediator.Send(new VincularPortalCommand(firebaseUid, email, request.Codigo));
            return Ok(new { Message = "Cuenta vinculada y activada con éxito." });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("registro-remoto")]
    [Authorize(AuthenticationSchemes = "Firebase")]
    public async Task<IActionResult> RegistroRemoto([FromBody] RegistroRemotoRequest request)
    {
        var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;

        if (string.IsNullOrEmpty(firebaseUid) || string.IsNullOrEmpty(email))
        {
            return BadRequest(new { Message = "No se pudieron obtener los datos de la cuenta de Google." });
        }

        try
        {
            var id = await _mediator.Send(new RegistrarPropietarioRemotoCommand(
                request.NombreCompleto,
                request.Telefono,
                email,
                request.Direccion,
                firebaseUid
            ));
            return Ok(new { Id = id, Message = "Perfil creado. Su cuenta se encuentra en proceso de verificación." });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var propietario = await GetCurrentPropietarioAsync();
        if (propietario == null)
        {
            return Ok(new { Linked = false });
        }

        return Ok(new 
        { 
            Linked = true, 
            Activo = propietario.Activo, 
            NombreCompleto = propietario.NombreCompleto,
            Email = propietario.CorreoElectronico
        });
    }

    [HttpGet("pets")]
    public async Task<ActionResult<List<MascotaDto>>> GetMyPets()
    {
        var propietario = await GetCurrentPropietarioAsync();
        if (propietario == null)
        {
            return Unauthorized(new { Message = "Cuenta no vinculada o perfil no encontrado." });
        }

        if (!propietario.Activo)
        {
            return StatusCode(403, new { Message = "Cuenta por verificar", Codigo = "PENDING_VERIFICATION" });
        }

        var pets = await _mediator.Send(new GetPetsForPortalQuery(propietario.Id));
        return Ok(pets);
    }

    [HttpGet("pets/{mascotaId}/history")]
    public async Task<ActionResult<List<PortalConsultaDto>>> GetPetHistory(int mascotaId)
    {
        var propietario = await GetCurrentPropietarioAsync();
        if (propietario == null)
        {
            return Unauthorized(new { Message = "Cuenta no vinculada o perfil no encontrado." });
        }

        if (!propietario.Activo)
        {
            return StatusCode(403, new { Message = "Cuenta por verificar", Codigo = "PENDING_VERIFICATION" });
        }

        if (!await IsPetOwnedByPropietarioAsync(mascotaId, propietario.Id))
        {
            return NotFound(new { Message = "La mascota no fue encontrada o no pertenece a su perfil." });
        }

        var history = await _mediator.Send(new GetClinicalHistoryQuery(mascotaId));

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
        var propietario = await GetCurrentPropietarioAsync();
        if (propietario == null)
        {
            return Unauthorized(new { Message = "Cuenta no vinculada o perfil no encontrado." });
        }

        if (!propietario.Activo)
        {
            return StatusCode(403, new { Message = "Cuenta por verificar", Codigo = "PENDING_VERIFICATION" });
        }

        if (!await IsPetOwnedByPropietarioAsync(mascotaId, propietario.Id))
        {
            return NotFound(new { Message = "La mascota no fue encontrada o no pertenece a su perfil." });
        }

        var weights = await _mediator.Send(new GetWeightHistoryQuery(mascotaId));
        return Ok(weights);
    }

    [HttpGet("pets/{mascotaId}/hospitalization")]
    public async Task<ActionResult<HospitalizacionDto>> GetPetHospitalization(int mascotaId)
    {
        var propietario = await GetCurrentPropietarioAsync();
        if (propietario == null)
        {
            return Unauthorized(new { Message = "Cuenta no vinculada o perfil no encontrado." });
        }

        if (!propietario.Activo)
        {
            return StatusCode(403, new { Message = "Cuenta por verificar", Codigo = "PENDING_VERIFICATION" });
        }

        if (!await IsPetOwnedByPropietarioAsync(mascotaId, propietario.Id))
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

    private async Task<Propietario?> GetCurrentPropietarioAsync()
    {
        // 1. Intentar con claim local propietarioId
        var localClaim = User.FindFirst("propietarioId")?.Value;
        if (int.TryParse(localClaim, out var localId))
        {
            return await _context.Propietarios.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == localId);
        }

        // 2. Intentar con Firebase User ID (sub / nameidentifier)
        var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(firebaseUid))
        {
            return await _context.Propietarios.AsNoTracking()
                .FirstOrDefaultAsync(p => p.FirebaseUserId == firebaseUid);
        }

        return null;
    }

    private async Task<bool> IsPetOwnedByPropietarioAsync(int mascotaId, int propietarioId)
    {
        var pet = await _context.Mascotas.AsNoTracking().FirstOrDefaultAsync(m => m.Id == mascotaId);
        return pet != null && pet.PropietarioId == propietarioId && pet.Activo;
    }
}

public class VincularRequest
{
    public string Codigo { get; set; } = string.Empty;
}

public class RegistroRemotoRequest
{
    public string NombreCompleto { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
}

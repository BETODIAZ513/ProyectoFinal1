using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetClinic.Application.Citas.Commands;
using PetClinic.Application.Citas.Models;
using PetClinic.Application.Citas.Queries;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Common.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api/citas")]
[Authorize]
public class CitasController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public CitasController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [Authorize(Roles = "Administrador")] // Listado general paginado de auditoría
    public async Task<ActionResult<PagedList<CitaDto>>> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetAppointmentsPagedQuery(page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador,Recepcionista,Veterinario")] // Agendamiento restrictivo
    public async Task<ActionResult<int>> Create([FromBody] CreateAppointmentCommand command)
    {
        try
        {
            var id = await _mediator.Send(command);
            return Ok(id);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}/estado")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(new { Message = "El identificador de la URL no coincide con el cuerpo del comando." });
        }

        try
        {
            var succeeded = await _mediator.Send(command);
            if (!succeeded)
            {
                return NotFound(new { Message = "La cita no fue encontrada." });
            }
            return NoContent();
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("hoy")]
    [Authorize(Roles = "Administrador,Recepcionista")] // Control de sala de espera de arribos diario
    public async Task<ActionResult<IEnumerable<CitaDto>>> GetToday()
    {
        var result = await _mediator.Send(new GetTodayAppointmentsQuery());
        return Ok(result);
    }

    [HttpGet("veterinario")]
    [Authorize(Roles = "Administrador,Recepcionista,Veterinario,AuxiliarClinico")] // Bandeja particular o filtro por médico
    public async Task<ActionResult<IEnumerable<CitaDto>>> GetByLoggedInVeterinarian([FromQuery] int? veterinarioId = null)
    {
        if (veterinarioId.HasValue)
        {
            var resultByVet = await _mediator.Send(new GetAppointmentsByVetIdQuery(veterinarioId.Value));
            return Ok(resultByVet);
        }

        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var result = await _mediator.Send(new GetAppointmentsByVeterinarianQuery(userId));
        return Ok(result);
    }
}

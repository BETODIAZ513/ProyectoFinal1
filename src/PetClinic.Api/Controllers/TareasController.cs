using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Tareas.Commands;
using PetClinic.Application.Tareas.Models;
using PetClinic.Application.Tareas.Queries;
using PetClinic.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TareasController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public TareasController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet("tareas-clinicas")]
    public async Task<ActionResult<IEnumerable<TareaClinicaDto>>> GetClinicalTasks()
    {
        var result = await _mediator.Send(new GetClinicalTasksQuery());
        return Ok(result);
    }

    [HttpPost("tareas-clinicas")]
    [Authorize(Roles = "Administrador,Veterinario")]
    public async Task<ActionResult<int>> CreateClinicalTask([FromBody] CreateClinicalTaskCommand command)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var finalCommand = command with { VeterinarioApplicationUserId = userId };

        try
        {
            var id = await _mediator.Send(finalCommand);
            return Ok(id);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("tareas-clinicas/{id}/estado")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateClinicalTaskStatusCommand command)
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
                return NotFound(new { Message = "La tarea clínica no fue encontrada." });
            }
            return NoContent();
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("tareas-predefinidas")]
    public async Task<ActionResult<IEnumerable<TareaPredefinida>>> GetPredefinedTasks()
    {
        var result = await _mediator.Send(new GetPredefinedTasksQuery());
        return Ok(result);
    }
}

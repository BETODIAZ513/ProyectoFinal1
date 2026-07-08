using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetClinic.Application.Veterinarios.Commands;
using PetClinic.Application.Veterinarios.Queries;
using PetClinic.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api/veterinarios")]
[Authorize] // Todos los usuarios autenticados pueden ver la lista
public class VeterinariosController : ControllerBase
{
    private readonly IMediator _mediator;

    public VeterinariosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Veterinario>>> GetAll([FromQuery] bool? activeOnly)
    {
        var result = await _mediator.Send(new GetVeterinariansQuery(activeOnly));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")] // Solo el Administrador puede dar de alta veterinarios
    public async Task<ActionResult<int>> Create([FromBody] CreateVeterinarianCommand command)
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

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVeterinarianCommand command)
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
                return NotFound(new { Message = "El veterinario no fue encontrado." });
            }
            return NoContent();
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(int id)
    {
        var succeeded = await _mediator.Send(new DeleteVeterinarianCommand(id));
        if (!succeeded)
        {
            return NotFound(new { Message = "El veterinario no fue encontrado." });
        }
        return NoContent();
    }
}

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetClinic.Application.Common.Models;
using PetClinic.Application.Propietarios.Commands;
using PetClinic.Application.Propietarios.Queries;
using PetClinic.Domain.Entities;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api/propietarios")]
[Authorize(Roles = "Administrador")] // REQ-PRO-01: Restringido a Administradores
public class PropietariosController : ControllerBase
{
    private readonly IMediator _mediator;

    public PropietariosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedList<Propietario>>> GetPaged([FromQuery] string? searchTerm, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetOwnersPagedQuery(searchTerm, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Propietario>> GetById(int id)
    {
        var result = await _mediator.Send(new GetOwnerByIdQuery(id));
        if (result == null)
        {
            return NotFound(new { Message = "El propietario no fue encontrado." });
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] CreateOwnerCommand command)
    {
        try
        {
            var id = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOwnerCommand command)
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
                return NotFound(new { Message = "El propietario no fue encontrado para actualizar." });
            }
            return NoContent();
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var succeeded = await _mediator.Send(new DeleteOwnerCommand(id));
        if (!succeeded)
        {
            return NotFound(new { Message = "El propietario no fue encontrado para desactivar." });
        }
        return NoContent();
    }
}

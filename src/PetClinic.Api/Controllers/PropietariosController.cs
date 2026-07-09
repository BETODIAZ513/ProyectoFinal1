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
public class PropietariosController : ControllerBase
{
    private readonly IMediator _mediator;

    public PropietariosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<ActionResult<PagedList<Propietario>>> GetPaged([FromQuery] string? searchTerm, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool onlyPending = false)
    {
        var result = await _mediator.Send(new GetOwnersPagedQuery(searchTerm, page, pageSize, onlyPending));
        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Administrador")]
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
    [Authorize(Roles = "Administrador")]
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
    [Authorize(Roles = "Administrador")]
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
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(int id)
    {
        var succeeded = await _mediator.Send(new DeleteOwnerCommand(id));
        if (!succeeded)
        {
            return NotFound(new { Message = "El propietario no fue encontrado para desactivar." });
        }
        return NoContent();
    }

    [HttpPost("{id}/generar-codigo")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<ActionResult<object>> GenerarCodigo(int id)
    {
        try
        {
            var code = await _mediator.Send(new GenerarCodigoVinculacionCommand(id));
            return Ok(new { Codigo = code });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/activar")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Activar(int id)
    {
        var succeeded = await _mediator.Send(new ActivarPropietarioCommand(id));
        if (!succeeded)
        {
            return NotFound(new { Message = "El propietario no fue encontrado." });
        }
        return NoContent();
    }
}

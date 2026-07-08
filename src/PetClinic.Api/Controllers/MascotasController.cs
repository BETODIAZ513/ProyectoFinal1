using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetClinic.Application.Common.Models;
using PetClinic.Application.Mascotas.Commands;
using PetClinic.Application.Mascotas.Models;
using PetClinic.Application.Mascotas.Queries;
using PetClinic.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api/mascotas")]
[Authorize] // Todos los roles autenticados pueden ver y gestionar pacientes
public class MascotasController : ControllerBase
{
    private readonly IMediator _mediator;

    public MascotasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedList<MascotaDto>>> GetPaged([FromQuery] string? searchTerm, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetPetsPagedQuery(searchTerm, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MascotaDto>> GetById(int id)
    {
        var result = await _mediator.Send(new GetPetByIdQuery(id));
        if (result == null)
        {
            return NotFound(new { Message = "La mascota no fue encontrada." });
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] CreatePetCommand command)
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
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePetCommand command)
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
                return NotFound(new { Message = "La mascota no fue encontrada para actualizar." });
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
        var succeeded = await _mediator.Send(new DeletePetCommand(id));
        if (!succeeded)
        {
            return NotFound(new { Message = "La mascota no fue encontrada para desactivar." });
        }
        return NoContent();
    }

    // Historial de pesos
    [HttpGet("{id}/pesos")]
    public async Task<ActionResult<IEnumerable<RegistroPeso>>> GetWeightHistory(int id)
    {
        var result = await _mediator.Send(new GetWeightHistoryQuery(id));
        return Ok(result);
    }

    [HttpPost("{id}/pesos")]
    public async Task<ActionResult<int>> CreateWeightRecord(int id, [FromBody] CreateWeightRecordCommand command)
    {
        if (id != command.MascotaId)
        {
            return BadRequest(new { Message = "El identificador de mascota de la URL no coincide." });
        }

        try
        {
            var recordId = await _mediator.Send(command);
            return Ok(recordId);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}

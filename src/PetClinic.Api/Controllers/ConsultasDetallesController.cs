using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetClinic.Application.Citas.Models;
using PetClinic.Application.Common.Models;
using PetClinic.Application.Consultas.Commands;
using PetClinic.Application.Consultas.Models;
using PetClinic.Application.Consultas.Queries;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api/consultas-detalles")]
[Authorize]
public class ConsultasDetallesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConsultasDetallesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Administrador,Veterinario")]
    public async Task<ActionResult<int>> Create([FromBody] CreateConsultationDetailCommand command)
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

    [HttpGet("mascota/{mascotaId}")]
    public async Task<ActionResult<IEnumerable<DetalleConsultaDto>>> GetByPetId(int mascotaId)
    {
        var result = await _mediator.Send(new GetClinicalHistoryQuery(mascotaId));
        return Ok(result);
    }

    [HttpGet("historial-citas")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<ActionResult<PagedList<CitaDto>>> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetAppointmentsHistoryQuery(page, pageSize));
        return Ok(result);
    }
}

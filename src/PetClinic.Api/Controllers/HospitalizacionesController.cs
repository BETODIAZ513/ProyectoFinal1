using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Hospitalizaciones.Commands;
using PetClinic.Application.Hospitalizaciones.Models;
using PetClinic.Application.Hospitalizaciones.Queries;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api/hospitalizaciones")]
[Authorize]
public class HospitalizacionesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public HospitalizacionesController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HospitalizacionDto>>> GetActive()
    {
        var result = await _mediator.Send(new GetHospitalizedPatientsQuery());
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador,Veterinario")]
    public async Task<ActionResult<int>> Admit([FromBody] AdmitPatientCommand command)
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

    [HttpPut("{id}/alta")]
    [Authorize(Roles = "Administrador,Veterinario")]
    public async Task<IActionResult> Discharge(int id)
    {
        try
        {
            var succeeded = await _mediator.Send(new DischargePatientCommand(id));
            if (!succeeded)
            {
                return NotFound(new { Message = "La hospitalización especificada no fue encontrada." });
            }
            return NoContent();
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("monitoreos")]
    public async Task<ActionResult<int>> CreateMonitoring([FromBody] CreateMonitoringRecordCommand command)
    {
        var username = _currentUserService.UserId ?? "Clínico";
        var finalCommand = command with { RegistradoPor = username };

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

    [HttpGet("{id}/monitoreos")]
    public async Task<ActionResult<IEnumerable<MonitoreoClinicoDto>>> GetMonitoringHistory(int id)
    {
        var result = await _mediator.Send(new GetMonitoringHistoryQuery(id));
        return Ok(result);
    }
}

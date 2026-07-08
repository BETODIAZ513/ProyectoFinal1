using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Common.Models.Auth;
using PetClinic.Infrastructure.Identity;
using System.Linq;
using System.Threading.Tasks;

namespace PetClinic.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        ICurrentUserService currentUserService)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _currentUserService = currentUserService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new LoginResponse { Succeeded = false, Message = "Usuario/Email y contraseña son obligatorios." });
        }

        // Buscar por Email o Username
        var user = await _userManager.FindByEmailAsync(request.UsernameOrEmail) 
                   ?? await _userManager.FindByNameAsync(request.UsernameOrEmail);

        if (user == null)
        {
            return Unauthorized(new LoginResponse { Succeeded = false, Message = "Credenciales incorrectas." });
        }

        // Validar si la cuenta está activa (REQ-PRO-01/REQ-VET-01 indirecta)
        if (!user.Activo)
        {
            return BadRequest(new LoginResponse { Succeeded = false, Message = "La cuenta de usuario se encuentra desactivada." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

        if (!result.Succeeded)
        {
            return Unauthorized(new LoginResponse { Succeeded = false, Message = "Credenciales incorrectas." });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenGenerator.GenerateToken(user.Id, user.UserName ?? "", user.NombreCompleto, roles);

        return Ok(new LoginResponse
        {
            Succeeded = true,
            Message = "Inicio de sesión correcto.",
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.UserName ?? "",
                Email = user.Email ?? "",
                NombreCompleto = user.NombreCompleto,
                Roles = roles
            }
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserDto
        {
            Id = user.Id,
            Username = user.UserName ?? "",
            Email = user.Email ?? "",
            NombreCompleto = user.NombreCompleto,
            Roles = roles
        });
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Application.Common.Models.Auth;
using PetClinic.Infrastructure.Identity;
using PetClinic.Infrastructure.Persistence;
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
    private readonly PetClinicDbContext _context;

    public AuthController(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        ICurrentUserService currentUserService,
        PetClinicDbContext context)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _currentUserService = currentUserService;
        _context = context;
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
        
        string? propietarioIdStr = null;
        int? propietarioIdVal = null;
        if (roles.Contains("Propietario"))
        {
            var propietario = await _context.Propietarios
                .FirstOrDefaultAsync(p => p.CorreoElectronico == user.Email && p.Activo);
            if (propietario != null)
            {
                propietarioIdVal = propietario.Id;
                propietarioIdStr = propietario.Id.ToString();
            }
        }

        var token = _jwtTokenGenerator.GenerateToken(user.Id, user.UserName ?? "", user.NombreCompleto, roles, propietarioIdStr);

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
                Roles = roles,
                PropietarioId = propietarioIdVal
            }
        });
    }

    [HttpPost("register-portal")]
    [AllowAnonymous]
    public async Task<ActionResult> RegisterPortal([FromBody] RegisterRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { Message = "El correo electrónico y la contraseña son obligatorios." });
        }

        // 1. Verificar si el correo pertenece a un Propietario registrado y activo
        var propietario = await _context.Propietarios
            .FirstOrDefaultAsync(p => p.CorreoElectronico == request.Email && p.Activo);
        if (propietario == null)
        {
            return BadRequest(new { Message = "El correo electrónico no está registrado en la clínica como propietario activo. Por favor, comuníquese con el personal." });
        }

        // 2. Verificar si ya existe una cuenta de usuario
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { Message = "Este correo electrónico ya se encuentra registrado." });
        }

        // 3. Crear el nuevo usuario de tipo Propietario
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            NombreCompleto = propietario.NombreCompleto,
            EmailConfirmed = true,
            Activo = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { Message = $"Error al crear la cuenta: {errors}" });
        }

        // 4. Asignar el rol de Propietario
        await _userManager.AddToRoleAsync(user, "Propietario");

        return Ok(new { Message = "Registro de cuenta exitoso. Ahora puede iniciar sesión." });
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

        int? propietarioIdVal = null;
        if (roles.Contains("Propietario"))
        {
            var propietario = await _context.Propietarios
                .FirstOrDefaultAsync(p => p.CorreoElectronico == user.Email && p.Activo);
            if (propietario != null)
            {
                propietarioIdVal = propietario.Id;
            }
        }

        return Ok(new UserDto
        {
            Id = user.Id,
            Username = user.UserName ?? "",
            Email = user.Email ?? "",
            NombreCompleto = user.NombreCompleto,
            Roles = roles,
            PropietarioId = propietarioIdVal
        });
    }
}

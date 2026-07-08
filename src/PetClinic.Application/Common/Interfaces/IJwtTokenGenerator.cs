using System.Collections.Generic;

namespace PetClinic.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(string userId, string userName, string fullName, IEnumerable<string> roles);
}

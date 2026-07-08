using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetClinic.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<(bool Succeeded, string UserId, string ErrorMessage)> CreateUserAsync(
        string userName, 
        string email, 
        string password, 
        string fullName, 
        IEnumerable<string> roles);
}

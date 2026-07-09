using System;
using Microsoft.EntityFrameworkCore;
using PetClinic.Application.Common.Interfaces;
using PetClinic.Infrastructure.Persistence;

namespace PetClinic.Application.UnitTests;

public class TestBase
{
    protected PetClinicDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<PetClinicDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockCurrentUserService = new TestCurrentUserService();

        return new PetClinicDbContext(options, mockCurrentUserService);
    }
}

public class TestCurrentUserService : ICurrentUserService
{
    public string? UserId => "TestUser";
    public string? UserName => "test_user";
}

public class TestIdentityService : IIdentityService
{
    public Task<(bool Succeeded, string UserId, string ErrorMessage)> CreateUserAsync(
        string userName, 
        string email, 
        string password, 
        string fullName, 
        IEnumerable<string> roles)
    {
        return Task.FromResult((true, "Mock_User_Id_123", ""));
    }
}

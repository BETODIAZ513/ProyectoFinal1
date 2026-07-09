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

using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PetClinic.IntegrationTests;

[TestClass]
public class AuthIntegrationTests : IntegrationTestBase
{
    [TestMethod]
    public async Task Login_WithCorrectCredentials_ReturnsTokenAndSucceeded()
    {
        // Act
        var response = await Client.PostAsJsonAsync("api/auth/login", new
        {
            UsernameOrEmail = "admin1@petclinic.com",
            Password = "Admin123!"
        });

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        Assert.IsNotNull(result);
        Assert.IsTrue(result.Succeeded);
        Assert.IsFalse(string.IsNullOrEmpty(result.Token));
    }

    [TestMethod]
    public async Task Login_WithIncorrectCredentials_ReturnsUnauthorized()
    {
        // Act
        var response = await Client.PostAsJsonAsync("api/auth/login", new
        {
            UsernameOrEmail = "admin1@petclinic.com",
            Password = "WrongPassword"
        });

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        Assert.IsNotNull(result);
        Assert.IsFalse(result.Succeeded);
        Assert.IsTrue(string.IsNullOrEmpty(result.Token));
    }

    [TestMethod]
    public async Task GetCurrentUser_WhenUnauthenticated_ReturnsUnauthorized()
    {
        // Act
        var response = await Client.GetAsync("api/auth/me");

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task GetCurrentUser_WhenAuthenticated_ReturnsUserInfo()
    {
        // Arrange
        await AuthenticateAsync("admin1@petclinic.com", "Admin123!");

        // Act
        var response = await Client.GetAsync("api/auth/me");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.IsNotNull(user);
        Assert.AreEqual("admin1@petclinic.com", user.Email);
    }

    private class LoginResponseDto
    {
        public bool Succeeded { get; set; }
        public string Token { get; set; } = string.Empty;
    }

    private class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}

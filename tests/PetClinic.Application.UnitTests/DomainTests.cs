using Microsoft.VisualStudio.TestTools.UnitTesting;
using PetClinic.Domain.Entities;

namespace PetClinic.Application.UnitTests;

[TestClass]
public class DomainTests
{
    [TestMethod]
    public void Mascota_ShouldBeActiveByDefault_WhenCreated()
    {
        // Act
        var pet = new Mascota();

        // Assert
        Assert.IsTrue(pet.Activo);
    }

    [TestMethod]
    public void Veterinario_ShouldBeActiveByDefault_WhenCreated()
    {
        // Act
        var vet = new Veterinario();

        // Assert
        Assert.IsTrue(vet.Activo);
    }

    [TestMethod]
    public void TareaClinica_ShouldBeInPendingState_ByDefault()
    {
        // Act
        var task = new TareaClinica();

        // Assert
        Assert.AreEqual("Pendiente", task.Estado);
    }
}

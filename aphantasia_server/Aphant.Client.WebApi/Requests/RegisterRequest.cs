using System.ComponentModel.DataAnnotations;

namespace Aphant.Core.Dto;

public class RegisterRequest
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
    [EmailAddress] public string? Email { get; set; }
}
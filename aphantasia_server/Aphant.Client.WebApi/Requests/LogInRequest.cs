using System.ComponentModel.DataAnnotations;

namespace Aphant.Core.Dto;

public class LogInRequest
{
    [Required] public string usernameOrEmail { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}
using System.Text.RegularExpressions;
using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Aphant.Core.Dto;

namespace Aphant.Impl.Auth;

internal partial class AuthService : IAuthService
{
    public async Task<Result> Register(string username, string password, string? email)
    {
        _log.LogInformation("Attempting to register user {username}", username);

        username = username.Trim();
        var errors = Error.BadRequest(string.Empty);

        if (username.Length < 3 || username.Length > 20)
        {
            errors.AddMessage("Username must be between 3 and 20 characters long");
        }
        if (!Regex.IsMatch(username, @"^[a-zA-Z0-9\-ÁáČčĎďÉéĚěÍíŇňÓóŘřŠšŤťÚúŮůÝýŽž]+$"))
        {
            errors.AddMessage("Username can only contain letters,numbers and dashes");
        }
        if (email is not null)
        {
            try
            {
                new System.Net.Mail.MailAddress(email);
            }
            catch (Exception)
            {
                errors.AddMessage("Invalid email adress");
            }
        }
        if (password.Length < 8)
        {
            errors.AddMessage("Password must be at least 8 characters long");
        }
        if (password.Length > 80)
        {
            errors.AddMessage("Password cannot be longer than 80 characters");
        }
        if (!Regex.IsMatch(password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"))
        {
            errors.AddMessage("Password must contain at leas one of: lowercase letter, uppercase letter and number");
        }
        if (!string.IsNullOrEmpty(errors.Message))
        {
            _log.LogInformation("Registration failed with errors\n{errors}", errors);
            return errors;
        }

        var hasher = new PasswordHasher<string>(); 
        var hashedPass = hasher.HashPassword(username, password);

        var result = await _dataService. InsertUser(username, hashedPass, "Newbie explorer", DateTime.UtcNow, email?.ToLower(), "#e0e0e0");

        if (result.IsSuccess)
        {
            _log.LogInformation("User {username} registered successfully.", username);
        }
        else
        {
            _log.LogInformation("Registration failed with error {error}", result.Error);
        }
        return result;
    }
}


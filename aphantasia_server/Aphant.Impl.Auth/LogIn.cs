using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Auth;

internal partial class AuthService : IAuthService
{
    public async Task<Result<string>> LogIn(string usernameOrEmail, string password)
    {
        await Task.Delay(Random.Shared.Next(300));
        _log.LogInformation("Login attempt");

        var user = usernameOrEmail.Contains('@')
            ? await _db.Users.Where(u => u.Email == usernameOrEmail.ToLower()).FirstOrDefaultAsync()
            : await _db.Users.Where(u => u.Username == usernameOrEmail).FirstOrDefaultAsync();

        if (user == null) return Fail();

        var hasher = new PasswordHasher<string>();
        var result = hasher.VerifyHashedPassword(user.Username, user.PassHash, password);

        if (result != PasswordVerificationResult.Success) return Fail();

        _log.LogInformation("User logged in successfully - {id}", user.Id);

        return JwtUtil.GenerateJwtToken(user.Id, _config);
    }

    private Error Fail()
    {
        _log.LogInformation("Login attempt failed");
        return Error.Unauthorized("Login failed. Check your credentials.");
    }
}


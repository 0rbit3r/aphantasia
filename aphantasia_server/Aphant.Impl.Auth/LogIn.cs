using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;

namespace Aphant.Impl.Auth;

internal partial class AuthService : IAuthContract
{
    public async Task<Result<string>> LogIn(string usernameOrEmail, string password)
    {
        await Task.Delay(Random.Shared.Next(300));
        _log.LogInformation("Login attempt");

        var userResult = await _userData.GetUserByUsernameOrEmail(usernameOrEmail);
        if (!userResult.IsSuccess) return Fail();

        var passHashResult = await _userData.GetUserPassHash(userResult.Payload!.Id);
        if (!passHashResult.IsSuccess) return Fail();

        var hasher = new PasswordHasher<string>();
        var result = hasher.VerifyHashedPassword(userResult.Payload!.Username, passHashResult.Payload!, password);

        if (result != PasswordVerificationResult.Success) return Fail();

        _log.LogInformation("User logged in successfully - {id}", userResult.Payload!.Id);

        return JwtUtil.GenerateJwtToken(userResult.Payload!.Id, _config);
    }

    private Error Fail()
    {
        _log.LogInformation("Login attempt failed");
        return Error.Unauthorized("Login failed. Please try again.");
    }
}
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Aphant.Core.Contract.Data;

namespace Aphant.Impl.Auth;

internal partial class AuthService(
    ILogger<AuthService> _log,
    IConfiguration _config,
    IUserDataContract _userData)
: IAuthContract
{
    public Task<Result> Authenticate(string token, Guid user)
    {
        throw new NotImplementedException();
    }

    public Task<Result> DeleteAccount(string usernameOrEmail, string password)
    {
        throw new NotImplementedException();
    }

    public Task<Result> LogOut(Guid user)
    {
        throw new NotImplementedException();
    }
}

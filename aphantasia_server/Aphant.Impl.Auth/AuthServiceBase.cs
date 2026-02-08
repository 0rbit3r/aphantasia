using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Auth;

internal partial class AuthService(
    ILogger<AuthService> _log, 
    IDataService _dataService)
: IAuthService
{
    public Task<Result> Authenticate(string token, Guid user)
    {
        throw new NotImplementedException();
    }

    public Task<Result> DeleteAccount(string usernameOrEmail, string password)
    {
        throw new NotImplementedException();
    }

    public Task<Result> Login(string usernameOrEmail, string password)
    {
        throw new NotImplementedException();
    }

    public Task<Result> LogOut(Guid user)
    {
        throw new NotImplementedException();
    }
}

using Aphant.Core.Database;
using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Auth;

internal partial class AuthService(
    ILogger<AuthService> _log, 
    AphantasiaDataContext _db, 
    IConfiguration _config,
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

    public Task<Result> LogOut(Guid user)
    {
        throw new NotImplementedException();
    }
}

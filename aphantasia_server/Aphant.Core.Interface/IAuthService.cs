using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Interface;

public interface IAuthService
{
    public Task<Result> RegisterAsync(string username, string password, string? email);

    public Task<Result> Login(string usernameOrEmail, string password);

    public Task<Result> LogOut(Guid user);

    public Task<Result> Authenticate(string token, Guid user);

    public Task<Result> DeleteAccount(string usernameOrEmail, string password);
}
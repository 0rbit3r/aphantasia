
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface IUserDataContract
{
    Task<Result<User>> GetUserById(Guid id);
    Task<Result<User>> GetUserByUsernameOrEmail(string usernameOrEmail);
    Task<Result<Guid>> InsertUser(
        string username,
        string passHash,
        string bio,
        DateTime? dateCreated = null,
        string? email = null,
        string? color = null);

    Task<Result<string>> GetUserPassHash(Guid id);
}

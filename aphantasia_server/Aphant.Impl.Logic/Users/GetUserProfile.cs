using Aphant.Core.Dto.Results;
using Aphant.Core.Contract.Logic;
using System.Text.RegularExpressions;
using Aphant.Core.Dto;

namespace Aphant.Impl.Logic.Users;

internal partial class UserLogicService : IUserLogicContract
{
    public async Task<Result<UserProfile>> GetUserProfile(Guid id)
    {
        var user = await _userData.GetUserById(id);
        if (!user.IsSuccess)
            return Error.NotFound("User with that id doesn\'t exist");

        var usersThoughts = await _thoughtData.GetUserProfileThoughts(id, null, null);

        return Result.Success(new UserProfile()
        {
            User=user.Payload!,
            Thoughts=usersThoughts.Payload!
        });
    }
}
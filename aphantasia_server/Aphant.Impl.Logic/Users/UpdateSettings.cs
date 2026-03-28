using Aphant.Core.Dto.Results;
using Aphant.Core.Contract.Logic;
using System.Text.RegularExpressions;

namespace Aphant.Impl.Logic.Users;

internal partial class UserLogicService : IUserLogicContract
{
    public async Task<Result> UpdateUserSettings(UserSettings settings)
    {
        if (!Regex.IsMatch(settings.Color, @"^\#[0-9a-f]{6}$"))
            return Error.BadRequest("Malformed color code");
        if (settings.Bio.Length > 300)
            return Error.BadRequest("Bio can be at most 300 characters long");

        return await _userData.UpdateSettings(settings);
    }
}
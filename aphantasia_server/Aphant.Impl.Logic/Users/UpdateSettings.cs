using Aphant.Core.Dto.Results;
using Aphant.Core.Contract.Logic;
using System.Text.RegularExpressions;
using Aphant.Core.Dto;

namespace Aphant.Impl.Logic.Users;

internal partial class UserLogicService : IUserLogicContract
{
    public async Task<Result> UpdateUserSettings(UserSettings settings)
    {
        if (!Regex.IsMatch(settings.Color, @"^\#[0-9a-f]{6}$"))
            return Error.BadRequest("Malformed color code");
        if (settings.Bio.Length > 300)
            return Error.BadRequest("Bio can be at most 300 characters long");

        var settingsResult = await _userData.UpdateSettings(settings);
        var colorsResult = await _userData.ChangeThoughtColorsOfUSer(settings.UserId, settings.Color);

        if (settingsResult.IsSuccess && colorsResult.IsSuccess)
            return Result.Success();
        return Error.General("Error while saving settings");
    }
}
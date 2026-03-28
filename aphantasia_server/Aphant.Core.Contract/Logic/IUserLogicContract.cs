using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Logic;

public interface IUserLogicContract
{
    Task<Result> UpdateUserSettings(UserSettings settings);
}

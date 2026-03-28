using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;
using Aphant.Impl.Logic.Thoughts;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Logic.Users;

internal partial class UserLogicService : IUserLogicContract
{
    private readonly ILogger<ThoughtLogicService> _log;
    private readonly IUserDataContract _userData;

    public UserLogicService(ILogger<ThoughtLogicService> log, IUserDataContract userData)
    {
        _log = log;
        _userData = userData;
    }

}
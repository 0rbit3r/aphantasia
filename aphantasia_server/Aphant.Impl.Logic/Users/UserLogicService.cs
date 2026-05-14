using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;
using Aphant.Impl.Logic.Thoughts;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Logic.Users;

internal partial class UserLogicService : IUserLogicContract
{
    private readonly ILogger<ThoughtLogicService> _log;
    private readonly IUserDataContract _userData;
    private readonly IThoughtDataContract _thoughtData; 

    public UserLogicService(ILogger<ThoughtLogicService> log, IUserDataContract userData, IThoughtDataContract thoughtData)
    {
        _log = log;
        _userData = userData;
        _thoughtData = thoughtData;
    }

}
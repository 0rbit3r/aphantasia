using Aphant.Core.Contract.Data;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Logic.Thoughts;

internal partial class ThoughtLogicService : IThoughtLogicContract
{
    private readonly ILogger<ThoughtLogicService> _log;
    private readonly IThoughtDataContract _thoughtData;
    private readonly INotificationDataContract _notificationData;

    public ThoughtLogicService(ILogger<ThoughtLogicService> log, IThoughtDataContract thoughtData, INotificationDataContract notificationData)
    {
        _log = log;
        _thoughtData = thoughtData;
        _notificationData = notificationData;
    }
}
using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Logic.Thoughts;

internal partial class ThoughtLogicService : IThoughtLogicContract
{
    private readonly ILogger<ThoughtLogicService> _log;
    private readonly IThoughtDataContract _thoughtData;
    private readonly INotificationDataContract _notificationData;
    private readonly IConceptDataContract _conceptData;

    public ThoughtLogicService(ILogger<ThoughtLogicService> log, IThoughtDataContract thoughtData, INotificationDataContract notificationData, IConceptDataContract conceptData)
    {
        _log = log;
        _thoughtData = thoughtData;
        _notificationData = notificationData;
        _conceptData = conceptData;
    }
}
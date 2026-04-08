using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;

namespace Aphant.Client.WebApi.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationController(
        INotificationDataContract _notificationData
    ) : ApiControllerBase
    {
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<Result<List<InboxNotification>>>> GetNotifications()
        {
            var userId = UserIdClaim;
            if (userId is null) return Unauthorized();

            return ResponseFromResult(await _notificationData.GetUserNotifications(userId.Value));
        }

        [HttpPost("{notificationId}/mark-read")]
        [Authorize]
        public async Task<ActionResult<Result>> MarkNotificationAsRead([FromRoute] Guid notificationId)
        {
            var userId = UserIdClaim;
            if (userId is null) return Unauthorized();

            var notificationResult = await _notificationData.GetNotification(notificationId);
            if (!notificationResult.IsSuccess)
                return ResponseFromResult(notificationResult.Error!);
            if (notificationResult.Payload!.RecipientId != userId)
                return Unauthorized();

            return ResponseFromResult(await _notificationData.MarkAsRead(notificationId));
        }

        [HttpPost("mark-read")]
        [Authorize]
        public async Task<ActionResult<Result>> MarkAllNotificationsAsRead()
        {
            var userId = UserIdClaim;
            if (userId is null) return Unauthorized();

            return ResponseFromResult(await _notificationData.MarkAllAsRead(userId.Value));
        }
    }
}

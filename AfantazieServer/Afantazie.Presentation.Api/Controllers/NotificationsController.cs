using Afantazie.Core.Localization.Errors;
using Afantazie.Presentation.Api.Helpers;
using Afantazie.Presentation.Model.Dto;
using Afantazie.Presentation.Model.Dto.Thought;
using Afantazie.Service.Interface.Thoughts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Afantazie.Presentation.Api.Controllers
{
    [Route("api/notifications")]
    public class NotificationsController : ApiControllerBase
    {
        private readonly INotificationService _service;

        public NotificationsController(IAuthValidationMessages _errorMessages,
            INotificationService notificationsService) : base(_errorMessages)
        {
            _service = notificationsService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<NotificationDto>>> GetNotifications([FromQuery] int amount)
        {
            if (UserId == null)
            {
                return Unauthorized();
            }
            var result = await _service.GetNotificationsForUser(UserId.Value, amount);

            if (!result.IsSuccess)
            {
                return ResponseFromError(result.Error!);
            }

            return result.Payload!.Select(n => new NotificationDto //todo - mapping
            {
                Id = n.Id,
                Color = n.Color,
                DateCreated = DateFormatHelper.ConvertSecondsToReadable(DateTime.Now - n.DateCreated),
                ThoughtAuthor = n.Thought?.Author.Username,
                isRead = n.IsRead,
                ThoughtId = n.Thought?.Id,
                ThoughtTitle = n.Thought?.Title,
                Type = (byte)n.Type,
            })
            .ToList();
        }

        [HttpGet("has-unread")]
        [Authorize]
        public async Task<ActionResult<bool>> GetUnreadNotificationsPresent()
        {
            if (UserId == null)
            {
                return Unauthorized();
            }
            var result = await _service.GetNotificationsForUser(UserId.Value, 100);
            //todo - This is botched - bubble this request down into the DB
            //also rethink the role and usage of "amount" entirely

            if (!result.IsSuccess)
            {
                return ResponseFromError(result.Error!);
            }

            if(result.Payload!.Any(n => !n.IsRead))
            {
                return true;
            }

            return false;
        }

        [HttpPost("{id}/mark-as-read")]
        [Authorize]
        public async Task<ActionResult> MarkNotificationsRead(int id)
        {
            if (UserId == null)
            {
                return Unauthorized();
            }
            var result = await _service.MarkNotificationRead(id);
            if (!result.IsSuccess)
            {
                return ResponseFromError(result.Error!);
            }
            return Ok();
        }

        [HttpPost("mark-all-read")]
        [Authorize]
        public async Task<ActionResult> MarkAllNotificationsRead()
        {
            if (UserId == null)
            {
                return Unauthorized();
            }
            var result = await _service.MarkAllNotificationsRead(UserId.Value);

            if (!result.IsSuccess)
            {
                return ResponseFromError(result.Error!);
            }

            return Ok();
        }
    }
}

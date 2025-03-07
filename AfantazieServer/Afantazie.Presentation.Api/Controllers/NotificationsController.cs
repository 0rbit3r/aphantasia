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
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetNotifications([FromQuery] int amount)
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

            return result.Payload!.Select(t => new ThoughtNodeDto
            {
                Color = t.Author.Color,
                Title = t.Title,
                Id = t.Id,
                DateCreated = DateFormatHelper.ConvertSecondsToReadable(DateTime.Now - t.DateCreated),
                Author = t.Author.Username,
                Size = t.Size,
            })
            .ToList();
        }
    }
}

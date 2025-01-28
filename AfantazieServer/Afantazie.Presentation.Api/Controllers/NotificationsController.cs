using Afantazie.Core.Localization.Errors;
using Afantazie.Presentation.Model.Dto;
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
        public async Task<ActionResult<List<NotificationDto>>> GetNotifications()
        {
            if (UserId == null)
            {
                return Unauthorized();
            }
            var result = await _service.GetNotificationsForUser(UserId.Value);

            return result.Select(t => new NotificationDto
            {
                Color = t.Author.Color,
                Title = $"{t.Author.Username}",
                Link = $"/graph/{t.Id}",
                Time = ConvertSecondsToReadable(DateTime.Now - t.DateCreated),
                Text = t.Title

            })
            .ToList();
        }

        private string ConvertSecondsToReadable(TimeSpan time) =>
        time.TotalSeconds switch
        {
            < 60 => $"{time.Seconds} s",
            < 3600 => $"{time.Minutes} min",
            < 86400 => $"{time.Hours} h",
            _ => $"{time.Days} d"
        };
    }
}

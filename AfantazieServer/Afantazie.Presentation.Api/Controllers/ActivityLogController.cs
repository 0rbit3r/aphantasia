using Afantazie.Core.Localization.Errors;
using Afantazie.Presentation.Api.Helpers;
using Afantazie.Presentation.Model.Dto;
using Afantazie.Presentation.Model.Dto.Thought;
using Afantazie.Service.Interface.SiteActivity;
using Microsoft.AspNetCore.Mvc;

namespace Afantazie.Presentation.Api.Controllers
{
    [Route("api/log")]
    [ApiController]
    public class ActivityLogController: ApiControllerBase
    {
        private readonly IActivityLogService _service;
        public ActivityLogController(IAuthValidationMessages _errorMessages,
            IActivityLogService service) : base(_errorMessages)
        {
            _service = service;
        }

        [HttpGet("latest")]
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetLatestLog([FromQuery] int amount)
        {
            var activityResult = await _service.GetLatestActivity(amount);
            if (!activityResult.IsSuccess)
            {
                return ResponseFromError(activityResult.Error!);
            }

            return activityResult.Payload!.Select(thought => new ThoughtNodeDto
            {
                Id = thought.Id,
                Title = thought.Title,
                Author = thought.Author.Username,
                Color = thought.Author.Color,
                DateCreated = DateFormatHelper.ConvertSecondsToReadable(DateTime.Now - thought.DateCreated),
                Backlinks = [],
                Links = []
            }).ToList();
        }

        [HttpGet("hot")]
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetHotLog([FromQuery] int amount)
        {
            var activityResult = await _service.GetHotActivity(amount);
            if (!activityResult.IsSuccess)
            {
                return ResponseFromError(activityResult.Error!);
            }

            return activityResult.Payload!.Select(thought => new ThoughtNodeDto { 
                Id = thought.Id,
                Author = thought.Author.Username,
                Color = thought.Author.Color,
                Title = thought.Title,
                DateCreated = DateFormatHelper.ConvertSecondsToReadable(DateTime.Now - thought.DateCreated),
                Backlinks = [],
                Links = []
                }).ToList();
        }

        //[HttpGet("notifications")]
        //public async Task<ActionResult<List<ThoughtNodeDto>>> GetNotificationsLog([FromQuery] int amount)
        //{
        //    if (UserId == null)
        //    {
        //        return Unauthorized();
        //    }

        //    var activityResult = await _service.GetNotificationsLog(UserId.Value, amount);

        //    if (!activityResult.IsSuccess)
        //    {
        //        return ResponseFromError(activityResult.Error!);
        //    }

        //    return activityResult.Payload!.Select(thought => new ThoughtNodeDto
        //    {
        //        Id = thought.Id,
        //        Author = thought.Author.Username,
        //        Color = thought.Author.Color,
        //        Title = thought.Title,
        //        DateCreated = DateFormatHelper.ConvertSecondsToReadable(DateTime.Now - thought.DateCreated),
        //        Backlinks = [],
        //        Links = []
        //    }).ToList();
        //}
    }
}

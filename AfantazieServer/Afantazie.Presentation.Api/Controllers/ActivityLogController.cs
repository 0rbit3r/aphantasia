using Afantazie.Core.Localization.Errors;
using Afantazie.Presentation.Api.Helpers;
using Afantazie.Presentation.Model.Dto;
using Afantazie.Presentation.Model.Dto.Thought;
using Afantazie.Service.Interface.SiteActivity;
using Afantazie.Service.Interface.Thoughts;
using Microsoft.AspNetCore.Mvc;

namespace Afantazie.Presentation.Api.Controllers
{
    [Route("api/log")]
    [ApiController]
    public class ActivityLogController: ApiControllerBase
    {
        private readonly IActivityLogService _logService;
        private readonly IThoughtService _thoughtService;

        public ActivityLogController(IAuthValidationMessages _errorMessages,
            IActivityLogService service, IThoughtService thoughtService) : base(_errorMessages)
        {
            _logService = service;
            _thoughtService = thoughtService;
            //todo - in the future get pinned from logservice and bubble the logic down to the repository layer
        }

        [HttpGet("latest")]
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetLatestLog([FromQuery] int amount)
        {
            var activityResult = await _logService.GetLatestActivity(amount);
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
            var activityResult = await _logService.GetHotActivity(amount);
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

        [HttpGet("big")]
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetBigLog([FromQuery] int amount)
        {
            var activityResult = await _logService.GetBiggest(amount);
            if (!activityResult.IsSuccess)
            {
                return ResponseFromError(activityResult.Error!);
            }

            return activityResult.Payload!.Select(thought => new ThoughtNodeDto
            {
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


        [HttpGet("pinned")]
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetPinnedThoughts([FromQuery] int amount)
        {
            var result = await _thoughtService.GetPinnedThoughtsAsync(amount);

            if (!result.IsSuccess)
            {
                return ResponseFromError(result.Error!);
            }

            return result.Payload!.Select(thought => new ThoughtNodeDto
            {
                Id = thought.Id,
                Author = thought.Author.Username,
                Color = thought.Author.Color,
                Title = thought.Title,
                DateCreated = DateFormatHelper.ConvertSecondsToReadable(DateTime.Now - thought.DateCreated),
                Backlinks = [],
                Links = []
            }).ToList(); //todo - mapping of dtos
        }
    }
}

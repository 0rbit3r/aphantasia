using Afantazie.Core.Localization.Errors;
using Afantazie.Core.Localization.ThoughtValidation;
using Afantazie.Core.Model;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Presentation.Model.Dto.Thought;
using Afantazie.Presentation.Model.Dto.ThoughtFiltering;
using Afantazie.Service.Interface.Thoughts;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection.Metadata.Ecma335;
using System.Text;

namespace Afantazie.Presentation.Api.Controllers
{
    [Route("api/thoughts")]
    [ApiController]
    public class ThoughtController: ApiControllerBase
    {
        private readonly IThoughtService _thoughtService;
        private readonly IThoughtValidationLocalization _localization;

        public ThoughtController(
            IThoughtService service,
            IAuthValidationMessages errors,
            IThoughtValidationLocalization locaization)
            : base(errors)
        {
            _thoughtService = service;
            _localization = locaization;
        }

        //[HttpGet("graph")]
        //public async Task<ActionResult<List<ThoughtDto>>> GetEntireGraph()
        //{

        //    var response = await _thoughtService.GetAllThoughts();

        //    if (!response.IsSuccess)
        //    {
        //        return ResponseFromError(response.Error!);
        //    }

        //    return response.Payload!.Adapt<List<ThoughtDto>>();
        //}

        [HttpGet]
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetTemporalThoughtsNodes(
            [FromQuery] ThoughtsTemporalFilterDto filter)
        {
            #region validations
            if (filter.Amount < 1)
            {
                filter.Amount = 200; //todo magic number
            }
            if (filter.AfterThoughtId.HasValue && filter.BeforeThoughtId.HasValue)
            {
                return BadRequest(new { Error = "Error" });
            }
            if (filter.AfterThoughtId.HasValue && filter.AroundThoughtId.HasValue)
            {
                return BadRequest(new { Error = "Error" });
            }
            if (filter.BeforeThoughtId.HasValue && filter.AroundThoughtId.HasValue)
            {
                return BadRequest(new { Error = "Error" });
            }
            #endregion

            var response = await _thoughtService.GetTemporalThoughtsAsync(
                filter.Adapt<ThoughtsTemporalFilter>());

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<List<ThoughtNodeDto>>();
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<FullThoughtDto>> GetThoughtById(int id)
        {
            var response = await _thoughtService.GetThoughtByIdAsync(id);

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<FullThoughtDto>();
        }

        [HttpGet("titles")]
        public async Task<ActionResult<List<ThoughtColoredTitleDto>>> GetThoughtTitles()
        {
            var response = await _thoughtService.GetAllThoughts();

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<List<ThoughtColoredTitleDto>>();
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<int>> CreateThought([FromBody] CreateThoughtDto thoughtDto)
        {
            var errors = new StringBuilder();
            if(thoughtDto.Content.Length > 1000 || thoughtDto.Content.Length < 5)
            {
                errors.AppendLine(_localization.InvalidContentLength);
            }
            if (thoughtDto.Title.Length > 100 || thoughtDto.Title.Length < 1)
            {
                errors.AppendLine(_localization.InvalidTitleLength);
            }
            if (errors.Length > 0)
            {
                return BadRequest(new { Error = errors.ToString() });

            }

            if (UserId is null)
                return Unauthorized();

            var response = await _thoughtService.CreateThoughtAsync(
                UserId.Value, thoughtDto.Title, thoughtDto.Content, thoughtDto.Links);

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!;
        }

        [HttpGet("total-count")]
        public async Task<ActionResult<int>> GetTotalThoughtCount()
        {
            var response = await _thoughtService.GetTotalThoughtCountAsync();

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!;
        }

        [HttpGet("{id}/replies")]
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetReplies(int id)
        {
            var response = await _thoughtService.GetRepliesAsync(id);

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<List<ThoughtNodeDto>>();
        }

        [HttpGet("{id}/neighborhood")]
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetNeighborhood(int id, [FromQuery]int depth)
        {
            var response = await _thoughtService.GetNeighborhoodAsync(id, depth);

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<List<ThoughtNodeDto>>();
        }
    }
}

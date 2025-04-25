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
        private readonly IValidationMessages _localization;

        public ThoughtController(
            IThoughtService service,
            IAuthValidationMessages errors,
            IValidationMessages locaization)
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
            [FromQuery] ThoughtsTemporalFilterDto filter, [FromQuery] string? concept)
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
                filter.Adapt<ThoughtsTemporalFilter>(), concept);

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

        // todo - this is useless - use the endpoint above
        [HttpGet("list")]
        public async Task<ActionResult<List<ThoughtNodeDto>>> GetAllThoughts()
        {
            var response = await _thoughtService.GetAllThoughts();

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<List<ThoughtNodeDto>>();
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<int>> CreateThought([FromBody] CreateThoughtDto thoughtDto)
        {
            thoughtDto.Content = thoughtDto.Content.Replace("\u200B", "").TrimEnd();
            thoughtDto.Title = thoughtDto.Title.Replace("\u200B", "").Trim();

            var errors = new StringBuilder();
            if(thoughtDto.Content.Length > 3000 || thoughtDto.Content.Length < 5)
            {
                errors.AppendLine(_localization.InvalidContentLength);
            }
            if (thoughtDto.Title.Length > 50 || thoughtDto.Title.Length < 1)
            {
                errors.AppendLine(_localization.InvalidTitleLength);
            }
            if (thoughtDto.Title.Contains("]") || thoughtDto.Title.Contains("["))
            {
                errors.AppendLine(_localization.SquareBracketsNotAllowed);
            }
            if (errors.Length > 0)
            {
                return BadRequest(new { Error = errors.ToString() });
            }

            if (UserId is null)
                return Unauthorized();

            var response = await _thoughtService.CreateThoughtAsync(
                UserId.Value, thoughtDto.Title, thoughtDto.Content, thoughtDto.Shape);

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }



            return response.Payload!;
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteThought(int id)
        {
            if (UserId is null)
                return Unauthorized();

            var thoughtResult = await _thoughtService.GetThoughtByIdAsync(id);

            if (!thoughtResult.IsSuccess)
            {
                return ResponseFromError(thoughtResult.Error!);
            }
            if (thoughtResult.Payload!.Author.Id != UserId)
            {
                return Unauthorized();
            }

            var deleteResult = await _thoughtService.DeleteThoughtAsync(id);

            if (!deleteResult.IsSuccess)
            {
                return ResponseFromError(deleteResult.Error!);
            }

            return Ok();
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
        public async Task<ActionResult<List<List<ThoughtNodeDto>>>> GetNeighborhood(int id, [FromQuery]int depth, [FromQuery]int limit)
        {
            var response = await _thoughtService.GetNeighborhoodAsync(id, depth, limit);

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<List<List<ThoughtNodeDto>>>();
        }
    }
}

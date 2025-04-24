using Afantazie.Core.Localization.Errors;
using Afantazie.Presentation.Model.Dto;
using Afantazie.Service.Interface.Thoughts;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Api.Controllers
{
    [Route("api/concepts")]
    [ApiController]
    public class ConceptController : ApiControllerBase
    {
        private readonly IConceptService _conceptService;

        public ConceptController(IAuthValidationMessages _errorMessages,
            IConceptService conceptService) : base(_errorMessages)
        {
            _conceptService = conceptService;
        }

        [HttpGet("{tag}")]
        public async Task<ActionResult<ConceptDto>> GetConceptInfo(string tag)
        {
            //todo - get concept info from the database
            var conceptResult = await _conceptService.GetConcept(tag);

            if (!conceptResult.IsSuccess)
            {
                return ResponseFromError(conceptResult.Error!);
            }

            return Ok(new ConceptDto
            {
                Color = conceptResult.Payload!.Color,
                Tag = conceptResult.Payload.Tag,
            });
        }
    }
}

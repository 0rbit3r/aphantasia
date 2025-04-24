using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Service.Interface.Thoughts;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Afantazie.Service.Thoughts
{
    internal class ConceptService
        (IConceptRepository _conceptRepository,
        ILogger<ConceptService> _log) : IConceptService
    {
        public async Task<Result> HandleNewThoughtConceptsAsync(Thought thought)
        {
            _log.LogDebug("Handling new thought hashtags");

            var matches = Regex.Matches(thought.Content, @"(?:^|\s)(_[0-9a-zA-Z]+)(_[0-9a-zA-Z]+)?(_[0-9a-zA-Z]+)?");

            var conceptObjects = new List<Concept>();

            foreach (Match tag in matches)
            {
                var subTags = new List<string>();
                if (tag.Groups[3].Success) subTags.Add($"{tag.Groups[1].Value}{tag.Groups[2].Value}{tag.Groups[3].Value}");
                if (tag.Groups[2].Success) subTags.Add($"{tag.Groups[1].Value}{tag.Groups[2].Value}");
                subTags.Add(tag.Groups[1].Value);

                // get subtags from DB and create if not exist
                foreach (var subTag in subTags)
                {
                    var existingTagsResult = await _conceptRepository.GetConcept(subTag);

                    if (!existingTagsResult.IsSuccess && existingTagsResult.Error is NotFoundError)
                    {
                        _log.LogInformation("Creating new hashtag: {tag}", tag);
                        var insertHashtagResult = await _conceptRepository.InsertConceptAsync(subTag, thought.Color);
                        if (!insertHashtagResult.IsSuccess) return insertHashtagResult.Error!;
                        conceptObjects.Add(insertHashtagResult.Payload!);
                    }
                    else if (!conceptObjects.Any(hashtagObjects => hashtagObjects.Tag == subTag))
                    {
                        conceptObjects.Add(existingTagsResult.Payload!);
                    }
                }
            }
            // add references to thought;
            foreach (var tag in conceptObjects)
            {
                var associationResult = await _conceptRepository.AssociateConceptToThought(thought.Id, tag.Id);
                if (!associationResult.IsSuccess) return associationResult.Error!;
            }

            return Result.Success();
        }
    
        public Task<Result<Concept>> GetConcept(string tag)
        {
            return _conceptRepository.GetConcept(tag);
        }
    }
}

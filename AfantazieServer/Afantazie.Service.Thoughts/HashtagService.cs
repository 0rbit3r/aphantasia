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
    internal class HashtagService
        (IHashtagRepository _hashtagRepository,
        ILogger<HashtagService> _log) : IHashtagService
    {
        public async Task<Result> HandleNewThoughtHashtagsAsync(Thought thought)
        {
            _log.LogDebug("Handling new thought hashtags");
            var hashtagsInContent = thought.Content.Split()
                .Where(x => x.StartsWith("#") && !x.Substring(1).Contains("#"))
                .ToList();

            var hashtagObjects = new List<Hashtag>();

            foreach (var tag in hashtagsInContent)
            {
                var subTags = tag.Split('/').ToList();
                if (subTags.Count >= 2) subTags[1] = $"{subTags[0]}/{subTags[1]}";
                if (subTags.Count == 3) subTags[2] = $"{subTags[0]}/{subTags[1]}/{subTags[2]}";

                // get subtags from DB and create if not exist
                foreach (var subTag in subTags)
                {
                    var existingTagsResult = await _hashtagRepository.GetHashtag(subTag);

                    if (!existingTagsResult.IsSuccess && existingTagsResult.Error is NotFoundError)
                    {
                        _log.LogInformation("Creating new hashtag: {tag}", tag);
                        var insertHashtagResult = await _hashtagRepository.InsertHashtagAsync(tag, thought.Color);
                        if (!insertHashtagResult.IsSuccess) return insertHashtagResult.Error!;
                        hashtagObjects.Add(insertHashtagResult.Payload!);
                    }
                    else if(!hashtagObjects.Any(hashtagObjects => hashtagObjects.Tag == subTag))
                    {
                        hashtagObjects.Add(existingTagsResult.Payload!);
                    }
                }
            }
            // add references to thought;
            foreach (var tag in hashtagObjects)
            {
                var associationResult = await _hashtagRepository.AssociateHashtagToThought(thought.Id, tag.Id);
                if (!associationResult.IsSuccess) return associationResult.Error!;
            }


            return Result.Success();
        }
    }
}

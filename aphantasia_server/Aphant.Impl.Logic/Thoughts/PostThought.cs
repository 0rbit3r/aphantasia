using System.Text;
using System.Text.RegularExpressions;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Microsoft.Extensions.Logging;
using Aphant.Core.Contract.Data;

namespace Aphant.Impl.Logic.Thoughts;

internal partial class ThoughtLogicService : IThoughtLogicContract
{
    public async Task<Result<Guid>> PostThought(Guid creatorId, string title, string content, ThoughtShape shape)
    {
        _log.LogInformation("Creating new thought: {title}", title);

        var validationResult = ValidateTitleAndContent(title, content);
        if (!validationResult.IsSuccess) return validationResult.Error!;

        var thoughtIdLinksResult = GetLinksAsync(content);
        if (!thoughtIdLinksResult.IsSuccess)
        {
            return thoughtIdLinksResult.Error!;
        }
        var thoughtIdLinks = thoughtIdLinksResult.Payload!;
        if (thoughtIdLinks.Count() > 3)
        {
            _log.LogWarning("Attempted to create a thought with more than 3 links ({count} in total)", thoughtIdLinks.Count());
            return Error.BadRequest("Too many links");
        }

        // validate references
        var errors = new StringBuilder();
        var linkedThoughts = new List<ThoughtLight>();
        foreach (var targetId in thoughtIdLinks)
        {
            var referencedThought = await _thoughtData.GetThoughtLightById(targetId);// Check exists would be enough here...
            if (!referencedThought.IsSuccess)
            {
                _log.LogWarning("Referenced thought with id {id} not found.", targetId);
                errors.Append($"- Thought with ID not found: {targetId}\n");
            }
            linkedThoughts.Add(referencedThought.Payload!);
        }

        if (errors.Length > 0)
        {
            return Error.BadRequest(errors.ToString().TrimEnd('\n'));
        }

        var insertResult = await _thoughtData.InsertThought(
            creatorId, title, content, shape);

        if (!insertResult.IsSuccess)
        {
            return insertResult.Error!;
        }

        var insertedThoughtResult = await _thoughtData.GetThoughtLightById(insertResult.Payload!);
        if(!insertedThoughtResult.IsSuccess)
        {
            _log.LogError("Failed to fetch thought from DB, even thought it was just created. This requires attention.");
            return Error.General("Server failed spectacularly");
        }

        // handle referenced thoughts
        foreach (var targetThought in linkedThoughts)
        {
            // first insert the reference
            var referenceResult = await _thoughtData.InsertThoughtReference(insertedThoughtResult.Payload!.Id, targetThought.Id);
            if (!referenceResult.IsSuccess)
            {
                _log.LogWarning("Error while inserting thought reference {src} -> {tgt}",
                    insertedThoughtResult.Payload!.Id, targetThought.Id);
            }

            // Then bump

            // self-replies don't bump
            if (targetThought.AuthorId == creatorId)
                continue;

            // check if the creator has already replied to the target thought
            var replies = await _thoughtData.GetRepliesOfThought(targetThought.Id);
            if (replies.IsSuccess && replies.Payload!.Count(t => t.AuthorId == creatorId) > 1)
                continue;
            

            var bumpResult = await _thoughtData.BumpThought(targetThought.Id);
            if (!bumpResult.IsSuccess)
            {
                _log.LogWarning("Error while bumping {id}, {message}", targetThought.Id, bumpResult.Error);
            }
        }

            //  await _hashtagService.HandleNewThoughtConceptsAsync(insertedThought.Payload!);

        //     await _notificationsRepository.HandleReplyNotificationsCreationAsync(insertedThought.Payload!.Id);
        //     //todo - add error handling here

        return insertedThoughtResult.Payload!.Id;
    }

    private Result<List<Guid>> GetLinksAsync(string content)
    {
        var references = new List<Guid>();
        var regex = new Regex(@"\[([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\]\[[^\[\]]+?\]", RegexOptions.Compiled);

        var matches = regex.Matches(content);
        if (matches.Count == 0)
        {
            return new List<Guid>();
        }
        foreach (Match match in matches)
        {
            var capturedId = match.Groups[1].Value;
            if (!Guid.TryParse(capturedId, out Guid thoughtId))
                return Error.BadRequest("Invalid thought id format.");

            references.Add(thoughtId);
        }

        return references;
    }

    private Result ValidateTitleAndContent(string title, string content)
    {
        
            var errors = new StringBuilder();
            if(content.Length > 3000 || content.Length < 5)
            {
                errors.AppendLine("Content must be between 5 and 3000 characters long");
            }
            if (title.Length > 50 || title.Length < 1)
            {
                errors.AppendLine("Title must be between 1 and 50 characters long");
            }
            if (title.Contains("]") || title.Contains("["))
            {
                errors.AppendLine("Title cannot contain characters [ and ]");
            }
            if (errors.Length > 0)
            {
                return Error.BadRequest(errors.ToString());
            }
            return Result.Success();
    }
}
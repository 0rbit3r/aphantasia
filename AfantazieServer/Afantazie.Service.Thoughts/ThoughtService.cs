using Afantazie.Core.Constants;
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
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Afantazie.Service.Thoughts
{
    public class ThoughtService(
        IThoughtRepository _repo,
        ILogger<ThoughtService> _logger
        ) : IThoughtService
    {
        public async Task<Result<int>> CreateThoughtAsync(
            int creatorId, string title, string content, ThoughtShape shape)
        {
            _logger.LogInformation("Creating new thought: {title}", title);

            var thoughtIdReferencesResult = await GetReferencesAsync(content);
            if (!thoughtIdReferencesResult.IsSuccess)
            {
                return thoughtIdReferencesResult.Error!;
            }
            var thoughtIdReferences = thoughtIdReferencesResult.Payload!;

            var result = await _repo.InsertThoughtAsync(
                title, content, creatorId, (byte)shape, thoughtIdReferences);

            if (!result.IsSuccess)
            {
                return result.Error!;
            }

            // validate references
            var errors = new StringBuilder();
            var referencedThoughts = new List<Thought>();
            foreach (var targetId in thoughtIdReferences)
            {
                var referencedThought = await _repo.GetThoughtById(targetId);
                if (!referencedThought.IsSuccess)
                {
                    _logger.LogWarning("Referenced thought with id {id} not found.", targetId);
                    errors.Append($"- Thought with ID {targetId} not found.\n"); 
                    //todo - Resources!
                }
                referencedThoughts.Add(referencedThought.Payload!);
            }

            if (errors.Length > 0)
            {
                return Error.Validation(errors.ToString().TrimEnd('\n'));
            }

            // bump all referenced thoughts
            foreach (var targetThought in referencedThoughts)
            {
                if (targetThought.Author.Id == creatorId)
                {
                    continue;
                }

                var replies = await GetRepliesAsync(targetThought.Id);
                if (replies.IsSuccess && replies.Payload!.Where(t => t.Author.Id == creatorId).Count() > 1)
                {
                    continue;
                }

                var bumpResult = await _repo.BumpThoughtAsync(targetThought.Id);
                if (!bumpResult.IsSuccess)
                {
                    _logger.LogWarning("Error while bumping {id}, {message}", targetThought.Id, bumpResult.Error);
                }
            }

            return result;
        }

        public async Task<Result<List<Thought>>> GetAllThoughts()
        {
            _logger.LogInformation("Requested thought graph.");

            return await _repo.GetAllThoughts();//todo this method us used for only coloerdtitles which is wasteful
        }

        public Task<Result<List<Thought>>> GetTemporalThoughtsAsync(ThoughtsTemporalFilter thoughtsTemporalFilter)
        {
            _logger.LogDebug("Requested temporal thoughts.");

            return thoughtsTemporalFilter.TemporalFilterType switch
            {
                TemporalFilterType.BeforeId => _repo.TakeBeforeId(thoughtsTemporalFilter.Amount, thoughtsTemporalFilter.ThoughtId!.Value),
                TemporalFilterType.AfterId => _repo.TakeAfterId(thoughtsTemporalFilter.Amount, thoughtsTemporalFilter.ThoughtId!.Value),
                TemporalFilterType.AroundId => _repo.TakeAroundId(thoughtsTemporalFilter.Amount, thoughtsTemporalFilter.ThoughtId!.Value),
                TemporalFilterType.Latest => _repo.TakeLatest(thoughtsTemporalFilter.Amount),
                _ => Task.FromResult(Result.Failure<List<Thought>>(Error.Validation("Wrong temporal filter format")))
            };
        }

        public async Task<Result<Thought>> GetThoughtByIdAsync(int id)
        {
            var result = await _repo.GetThoughtById(id);
            if (!result.IsSuccess)
            {
                _logger.LogWarning("Thought with id {id} not found.", id);
                return result;
            }
            _logger.LogInformation("Get thought [{id}] {title}", id, result.Payload!.Title);
            return result;
        }

        public Task<Result<int>> GetTotalThoughtCountAsync()
        {
            _logger.LogDebug("Requested total thought count.");
            return _repo.GetTotalThoughtsCountAsync();
        }

        public async Task<Result<List<Thought>>> GetRepliesAsync(int thoughtId)
        {
            var thought = await _repo.GetThoughtById(thoughtId);

            if (!thought.IsSuccess)
            {
                return thought.Error!;
            }

            var replies = new List<Thought>();

            foreach (var link in thought.Payload!.Backlinks)
            {
                var reply = await _repo.GetThoughtById(link.SourceId);

                if (!reply.IsSuccess)
                {
                    _logger.LogWarning("Link with id {id} not found.", link.Id);
                }
                else
                {
                    replies.Add(reply.Payload!);
                }
            }

            return replies;
        }

        public async Task<Result<List<List<Thought>>>> GetNeighborhoodAsync(int id, int depth)
        {
            var foundThoughts = new List<Thought>();
            var foundThoughtsDepths = new Dictionary<int, int>();

            var initialThought = await _repo.GetThoughtById(id);
            if (!initialThought.IsSuccess)
            {
                return initialThought.Error!;
            }

            foundThoughts.Add(initialThought.Payload!);
            foundThoughtsDepths.Add(id, 0);

            int visited = 0;
            while (foundThoughts.Count > visited)
            {
                var currentThought = foundThoughts[visited];
                var currentDepth = foundThoughtsDepths[currentThought.Id];
                if (currentDepth >= depth)
                {
                    visited++;
                    continue;
                }
                foreach (var link in currentThought.Links)
                {
                    if (foundThoughts.Any(t => t.Id == link.TargetId))
                    {
                        continue;
                    }
                    var linkedThought = await _repo.GetThoughtById(link.TargetId);
                    if (linkedThought.IsSuccess)
                    {
                        foundThoughts.Add(linkedThought.Payload!);
                        foundThoughtsDepths.Add(linkedThought.Payload!.Id, currentDepth + 1);
                    }
                }
                foreach (var backlink in currentThought.Backlinks)
                {
                    if (foundThoughts.Any(t => t.Id == backlink.SourceId))
                    {
                        continue;
                    }
                    var backlinkedThought = await _repo.GetThoughtById(backlink.SourceId);
                    if (backlinkedThought.IsSuccess)
                    {
                        foundThoughts.Add(backlinkedThought.Payload!);
                        foundThoughtsDepths.Add(backlinkedThought.Payload!.Id, currentDepth + 1);

                    }
                }
                visited++;
            }

            var result = new List<List<Thought>>();

            for (int i = 0; i <= depth; i++)
            {
                result.Add(foundThoughts.Where(t => foundThoughtsDepths[t.Id] == i).ToList());
            }

            return result;
        }

        private async Task<Result<List<int>>> GetReferencesAsync(string content)
        {
            var references = new List<int>();
            var regex = new Regex(@"\[([0-9]+)\]\[.*\]", RegexOptions.None, TimeSpan.FromSeconds(5));

            var matches = regex.Matches(content);
            if (matches.Count == 0)
            {
                return new List<int>();
            }
            foreach (Match match in matches)
            {
                var capturedId = match.Groups[1].Value;
                if (!int.TryParse(capturedId, out int thoughtId))
                    return Error.Validation("Invalid thought id format.");

                references.Add(thoughtId);
            }

            return references;
        }
    }
}

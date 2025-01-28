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
using System.Threading.Tasks;

namespace Afantazie.Service.Thoughts
{
    public class ThoughtService(
        IThoughtRepository _repo,
        ILogger<ThoughtService> _logger
        ) : IThoughtService
    {
        public async Task<Result<int>> CreateThoughtAsync(int creatorId, string title, string content, List<int> thoughtIdReferences)
        {
            _logger.LogInformation("Creating new thought: {title}", title);
            var result = await _repo.InsertThoughtAsync(
                title, content, creatorId, thoughtIdReferences);

            if(!result.IsSuccess)
            {
                return result.Error!;
            }

            // bump all referenced thoughts
            foreach (var targetId in thoughtIdReferences)
            {
                
                var referencedThought = await _repo.GetThoughtById(targetId);
                if (!referencedThought.IsSuccess)
                {
                    _logger.LogWarning("Referenced thought with id {id} not found.", targetId);
                    continue;
                }
                if (referencedThought.Payload!.Author.Id == creatorId)
                {
                    continue;
                }
                
                var replies = await GetRepliesAsync(targetId);
                if (replies.IsSuccess && replies.Payload!.Where(t => t.Author.Id == creatorId).Count() > 1)
                {
                    continue;
                }

                var bumpResult = await _repo.BumpThoughtAsync(targetId);
                if (!bumpResult.IsSuccess)
                {
                    _logger.LogWarning("Error while bumping {id}, {message}", targetId,  bumpResult.Error);
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
            _logger.LogInformation("Requested thought [{id}] {title}", id, result.Payload!.Title);
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

        public async Task<Result<List<Thought>>> GetNeighborhoodAsync(int id, int depth)
        {
            var foundThoughts = new List<Thought>();
            var foundThoughtsDepths = new Dictionary<int, int>();
            
            var initialThought = await _repo.GetThoughtById(id);
            if(!initialThought.IsSuccess)
            {
                return initialThought.Error!;
            }

            foundThoughts.Add(initialThought.Payload!);
            foundThoughtsDepths.Add(id, 0);

            int visited = 0; 
            while(foundThoughts.Count > visited)
            {
                var currentThought = foundThoughts[visited];
                var currentDepth = foundThoughtsDepths[currentThought.Id];
                if (currentDepth >= depth)
                {
                    visited++;
                    continue;
                }
                foreach(var link in currentThought.Links)
                {
                    if (foundThoughts.Any(t => t.Id == link.TargetId))
                    {
                        continue;
                    }
                    var linkedThought = await _repo.GetThoughtById(link.TargetId);
                    if(linkedThought.IsSuccess)
                    {
                        foundThoughts.Add(linkedThought.Payload!);
                        foundThoughtsDepths.Add(linkedThought.Payload!.Id, currentDepth + 1);
                    }
                }
                foreach(var backlink in currentThought.Backlinks)
                {
                    if (foundThoughts.Any(t => t.Id == backlink.SourceId))
                    {
                        continue;
                    }
                    var backlinkedThought = await _repo.GetThoughtById(backlink.SourceId);
                    if(backlinkedThought.IsSuccess)
                    {
                        foundThoughts.Add(backlinkedThought.Payload!);
                        foundThoughtsDepths.Add(backlinkedThought.Payload!.Id, currentDepth + 1);

                    }
                }
                visited++;
            }

            return foundThoughts;
        }
    }
}

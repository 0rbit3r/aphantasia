using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;

namespace Afantazie.Service.Interface.Thoughts
{
    public interface IThoughtService
    {
        /// <summary>
        /// Parses new thought, inserts it, creates notifications, handles hashtags...
        /// </summary>
        /// <returns></returns>
        Task<Result<int>> CreateThoughtAsync(int creatorId, string title, string content, ThoughtShape shape);

        /// <summary>
        /// Gets last thoughts and limits them based on user - selected maximum thoughts.
        /// </summary>
        Task<Result<List<Thought>>> GetAllThoughts();

        Task<Result<List<Thought>>> GetTemporalThoughtsAsync(
            ThoughtsTemporalFilter thoughtsTemporalFilter, string? concept);

        Task<Result<Thought>> GetThoughtByIdAsync(int id);

        Task<Result<int>> GetTotalThoughtCountAsync();

        Task<Result<List<Thought>>> GetRepliesAsync(int thoughtId);

        /// <summary>
        /// BFS
        /// </summary>
        /// <param name="id"></param>
        /// <param name="depth"></param>
        /// <returns></returns>
        Task<Result<List<List<Thought>>>> GetNeighborhoodAsync(int id, int depth, int limit);

        /// <summary>
        /// Deletes a thought entirely - concept associations, links, the thought itself
        /// and  TODO notifications.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<Result> DeleteThoughtAsync(int id);

        Task<Result<List<Thought>>> GetPinnedThoughtsAsync(int amount);
    }
}

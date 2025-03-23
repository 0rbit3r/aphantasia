using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;

namespace Afantazie.Service.Interface.Thoughts
{
    public interface IThoughtService
    {
        Task<Result<int>> CreateThoughtAsync(int creatorId, string title, string content, ThoughtShape shape);

        /// <summary>
        /// Gets last thoughts and limits them based on user - selected maximum thoughts.
        /// </summary>
        Task<Result<List<Thought>>> GetAllThoughts();

        Task<Result<List<Thought>>> GetTemporalThoughtsAsync(ThoughtsTemporalFilter thoughtsTemporalFilter);

        Task<Result<Thought>> GetThoughtByIdAsync(int id);

        Task<Result<int>> GetTotalThoughtCountAsync();

        Task<Result<List<Thought>>> GetRepliesAsync(int thoughtId);

        /// <summary>
        /// BFS
        /// </summary>
        /// <param name="id"></param>
        /// <param name="depth"></param>
        /// <returns></returns>
        Task<Result<List<List<Thought>>>> GetNeighborhoodAsync(int id, int depth);
    }
}

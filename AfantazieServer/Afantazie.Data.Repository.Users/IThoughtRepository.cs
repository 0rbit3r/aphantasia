using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;

namespace Afantazie.Data.Interface.Repository
{
    public interface IThoughtRepository
    {
        Task<Result<List<Thought>>> GetAllThoughtsAsync();

        Task<Result<List<Thought>>> GetThoughtsAfterDate(DateTime date);

        Task<Result<List<Thought>>> GetLatestLog(int amount);

        Task<Result<Thought>> GetThoughtByIdAsync(int id);

        Task<Result<IEnumerable<Thought>>> GetThoughtsByOwner(int ownerId);

        Task<Result<int>> InsertThoughtAsync(string title, string content, int authorId, byte shape, IEnumerable<int> references);

        Task<Result<int>> GetTotalThoughtsCountAsync();

        Task<Result<List<Thought>>> TakeBeforeId(int amount, int id, string? concept);

        Task<Result<List<Thought>>> TakeAfterId(int amount, int thoughtId, string? concept);

        Task<Result<List<Thought>>> TakeAroundId(int amount, int thoughtId, string? concept);

        Task<Result<List<Thought>>> TakeLatest(int amount, string? concept);

        Task<Result<int>> BumpThoughtAsync(int targetId);

        Task<Result<List<Thought>>>GetUsersThoughts(int user);

        Task<Result<List<Thought>>> GetBiggestThoughts(int amount);

        Task<Result> DeleteThoughtAsync(int id);
    }
}

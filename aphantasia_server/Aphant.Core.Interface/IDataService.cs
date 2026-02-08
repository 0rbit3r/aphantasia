using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Interface;

public interface IDataService
{
    // Thoughts
    Task<Result<Thought>> GetThoughtAsync(Guid id);
    Task<Result<Guid>> CreateThought(
                                        Guid user,
                                        string title,
                                        string content,
                                        byte shape,
                                        List<Guid> links);

    // Users
    Task<Result<User>> GetUserById(Guid id);

    Task<Result<Guid>> InsertUser(
                                        string username,
                                        string passHash,
                                        string bio,
                                        DateTime? dateCreated = null,
                                        string? email = null,
                                        string? color = null);

    Task<Result<Epoch>> GetEpochAsync(int id);
}

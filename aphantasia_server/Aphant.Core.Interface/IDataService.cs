using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Interface;

public interface IDataService
{
    Task<Result<Thought>> GetThoughtAsync(Guid id);
    

    // Will only create new thought in database - no business logic attached
    Task<Result<Guid>> CreateThought(Guid user, string title, string content, byte shape, List<Guid> links);

    Task<Result<Epoch>> GetEpochAsync(Guid id);

    Task<Result<Guid>> InsertUser(string username, string passHash, string bio, DateTime? dateCreated = null, string? email = null, string? color = null );
}

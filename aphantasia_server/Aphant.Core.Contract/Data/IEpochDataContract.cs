using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface IEpochDataContract
{
    /// <summary>
    /// Will create a new epoch and assign the first "numberOfThoughts" of the epoch-less thoughts to it.
    /// </summary>
    Task<Result<Epoch>> CreateEpoch(int numberOfThoughts);

    // returns either the desired epoch or, when id is null, epoch-less thoughts
    Task<Result<Epoch>> GetEpochAsync(int? id = null);

    /// <summary>
    /// Returns the latest N thougths - for the main entry point to the website
    /// </summary>
    Task<Result<List<ThoughtNode>>> GetLatestContext(int numberOfThoughts);
}

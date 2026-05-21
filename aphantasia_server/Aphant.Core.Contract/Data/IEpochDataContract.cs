using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface IEpochDataContract
{
    /// <summary>
    /// Will create a new epoch and assign the first "numberOfThoughts" of the epoch-less thoughts to it.
    /// </summary>
    Task<Result<Epoch>> CreateEpoch(int numberOfThoughts);

    /// <summary>
    /// Returns desired epoch with thoughts belonging to it.
    /// </summary>
    /// <param name="id">Either id of existing epoch or -1 or -2 for latest context and epochless thoughts only respectively</param>
    Task<Result<Epoch>> GetEpochAsync(int id);

    /// <summary>
    /// Returns the latest N thougths - for the main entry point to the website
    /// </summary>
    Task<Result<List<ThoughtNode>>> GetLatestContext(int numberOfThoughts);
}

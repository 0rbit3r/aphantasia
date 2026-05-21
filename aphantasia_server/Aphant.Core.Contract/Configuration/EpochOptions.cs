using System.ComponentModel.DataAnnotations;

namespace Aphant.Core.Contracta.Configuration;

public class EpochOptions
{
    [Range(10, int.MaxValue)]
    public int ThoughtsPerEpoch { get; set; }
    [Range(1, int.MaxValue)]
    public int ManageEpochsEveryXMinutes { get; set; }
}

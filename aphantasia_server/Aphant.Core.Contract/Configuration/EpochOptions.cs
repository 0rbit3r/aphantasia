using System.ComponentModel.DataAnnotations;

namespace Aphant.Core.Contracta.Configuration;

public class EpochOptions
{
    [Required]
    [Range(10, int.MaxValue)]
    public int ThoughtsPerEpoch { get; set; }
    [Required]
    [Range(1, int.MaxValue)]
    public int ManageEpochsEveryXMinutes { get; set; }
}

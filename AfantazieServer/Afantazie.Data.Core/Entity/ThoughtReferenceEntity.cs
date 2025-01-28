using System.ComponentModel.DataAnnotations;

namespace Afantazie.Data.Model.Entity
{
    public class ThoughtReferenceEntity : IEntity
    {
        [Key]
        public int Id { get; set; }

        // The source thought (outgoing link)
        public required int SourceId { get; set; }
        public ThoughtEntity SourceThought { get; set; } = null!;

        // The target thought (where the link points to)
        public required int TargetId { get; set; }
        public ThoughtEntity TargetThought { get; set; } = null!;
    }
}
using System.ComponentModel.DataAnnotations;

namespace Aphant.Core.Database.Entity;

public class ConceptEntity
{
    [Key]
    public required string Tag { get; set; }
    public required string Color { get; set; }
    public DateTime DateCreated { get; set; }
    public ICollection<ThoughtEntity> Thoughts = [];
    public ICollection<UserEntity> Followers = [];
}
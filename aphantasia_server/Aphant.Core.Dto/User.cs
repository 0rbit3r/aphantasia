namespace Aphant.Core.Dto;

public class UserLight
{
    public Guid Id { get; set; }

    public required string Name { get; set; } 

    public required string Color { get; set; }
}
namespace Aphant.Core.Dto;


public class User
{
    public Guid Id { get; set; }

    public required string Username { get; set; }

    public required string Color { get; set; }

    public required string DateJoined { get; set; }

    public required string Bio { get; set; }
}

public class UserLight
{
    public Guid Id { get; set; }

    public required string Username { get; set; }

    public required string Color { get; set; }
}
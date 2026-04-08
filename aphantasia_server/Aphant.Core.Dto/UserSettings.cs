namespace Aphant.Core.Dto;

public class UserSettings
{
    public Guid UserId { get; set; }

    public string Color { get; set; } = "#eeeeee";

    public string Bio { get; set; } = "";
}
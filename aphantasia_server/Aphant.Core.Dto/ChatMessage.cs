namespace Aphant.Core.Dto;

public class ChatMessage
{
    public Guid Id { get; set; }
    public Guid AuthorId { get; set; }
    public string AuthorUsername { get; set; } = "";
    public string AuthorColor { get; set; } = "#eeeeee";
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public Guid? ParentId { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
}

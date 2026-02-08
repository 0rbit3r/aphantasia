namespace Aphant.Core.Dto;

public class CreateThoughtRequest
{
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required ThoughtShape Shape { get; set; }
}
using System.ComponentModel.DataAnnotations;

namespace Aphant.Core.Dto;

// Full thought will all information available
public class InboxNotification
{
    public Guid Id { get; set; }
    public Guid RecipientId { get; set; }
    public bool Read { get; set; }
    public string? Text { get; set; }
    public ThoughtTitle? Thought { get; set; }
    public UserColorName? FromUser { get; set; }
    public string DateCreated { get; set; } = string.Empty;
}

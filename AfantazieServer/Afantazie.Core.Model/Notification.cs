
namespace Afantazie.Core.Model
{
    public class Notification
    {

        public int Id { get; set; }

        public string Color { get; set; } = "#FFFFFF";

        public int UserId { get; set; }

        public Thought? Thought { get; set; }

        public NotificationType Type { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    }
}

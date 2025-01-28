using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto
{
    public class LogDto
    {
        public LogDto(int thoughtId, string title, string timeAgo, string color, string author)
        {
            ThoughtId = thoughtId;
            Title = title;
            TimeAgo = timeAgo;
            Color = color;
            Author = author;
        }

        public int ThoughtId { get; set; }

        public string Title { get; set; }

        public string TimeAgo { get; set; }

        public string Color { get; set; }

        public string Author { get; set; }
    }
}

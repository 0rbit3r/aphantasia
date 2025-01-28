using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto.Thought
{
    public class FullThoughtDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = "";

        public string Author { get; set; } = "";

        public string Content { get; set; } = "";

        public string DateCreated { get; set; } = "";

        public string Color { get; set; } = "";

        public List<int> Links { get; set; } = new List<int>();

        public List<int> Backlinks { get; set; } = new List<int>();
        public object Size { get; internal set; }
    }
}

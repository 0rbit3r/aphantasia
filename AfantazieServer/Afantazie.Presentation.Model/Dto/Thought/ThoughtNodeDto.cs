using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto.Thought
{
    public class ThoughtNodeDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = "";

        public string Author { get; set; } = "";

        public string DateCreated { get; set; } = "";

        public string Color { get; set; } = "";

        public byte Shape { get; set; } = 0;

       public List<int> Links { get; set; } = new List<int>();

        public List<int> Backlinks { get; set; } = new List<int>();

        public int Size { get; set; } = 1;

        public double? PositionX {get; set;}

        public double? PositionY {get; set;}
    }
}

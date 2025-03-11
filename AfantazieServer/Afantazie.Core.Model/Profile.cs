using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model
{
    public class Profile
    {
        public IList<Thought> Thoughts { get; set; } = [];

        public string Username { get; set; } = "";

        public string Color { get; set; } = "";

        public int TotalCount { get; set; }

        public string JoinedDate { get; set; } = "";
    }
}

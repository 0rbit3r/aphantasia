using Afantazie.Core.Constants;
using Afantazie.Presentation.Model.Dto.Thought;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto
{
    public class ProfileDto
    {
        public IList<ThoughtNodeDto> Thoughts { get; set; } = [];

        public string Username { get; set; } = "";

        public string Color { get; set; } = "";

        public int TotalCount { get; set; }

        public string JoinedDate { get; set; } = "";

        public string Bio { get; set; } = AfantazieConstants.DefaultBio;
    }
}
